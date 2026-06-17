import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { budgetSchema } from "../api/budget.contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import type { Budget } from "../api/budget.contract";
import { useCreateBudgetMutation as useCreateBudgetMutationHook, useUpdateBudgetMutation as useUpdateBudgetMutationHook } from "../api/budget.mutations";
import { createPortal } from "react-dom";

interface BudgetFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  budget?: Budget | null; // If provided, we are editing this budget
}

const MONTHS = [
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

export function BudgetFormDialog({ isOpen, onClose, budget }: BudgetFormDialogProps) {
  const createBudgetMutation = useCreateBudgetMutationHook();
  const updateBudgetMutation = useUpdateBudgetMutationHook();

  const isEditing = !!budget;
  const isPending = createBudgetMutation.isPending || updateBudgetMutation.isPending;

  // Local state for currency formatted display
  const [amountInput, setAmountInput] = useState("");

  const handleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    handleChange: (v: number) => void
  ) => {
    const input = e.target;
    const rawVal = input.value;
    const selectionStart = input.selectionStart || 0;

    // Count non-digit characters before cursor
    const valBeforeCursor = rawVal.substring(0, selectionStart);
    const digitsBeforeCursor = valBeforeCursor.replace(/\D/g, "").length;

    // Clean all non-digits
    const cleanVal = rawVal.replace(/\D/g, "");
    const numericVal = cleanVal === "" ? null : Number(cleanVal);

    // Format with dots
    const formattedVal = cleanVal === "" ? "" : cleanVal.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    setAmountInput(formattedVal);
    handleChange(numericVal as unknown as number);

    // Restore cursor position based on digit count
    requestAnimationFrame(() => {
      let newCursorPosition = 0;
      let digitCount = 0;
      for (let i = 0; i < formattedVal.length; i++) {
        if (digitCount === digitsBeforeCursor) {
          break;
        }
        if (/\d/.test(formattedVal[i])) {
          digitCount++;
        }
        newCursorPosition = i + 1;
      }
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  };

  // Generate Year Options
  const currentYearVal = new Date().getFullYear();
  const yearOptions = Array.from({ length: 8 }, (_, idx) => {
    const yr = currentYearVal - 2 + idx;
    return { label: yr.toString(), value: yr.toString() };
  });

  // Local state for Month and Year selection dropdowns
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonthIdx = new Date().getMonth() + 1;
    return String(currentMonthIdx).padStart(2, "0");
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    return String(new Date().getFullYear());
  });

  // TanStack Form configuration
  const form = useForm({
    defaultValues: {
      category: "",
      amount: null as unknown as number,
      month_year: "",
    },
    validators: {
      onChange: budgetSchema,
    },
    onSubmit: async ({ value }) => {
      // Build final month_year string: YYYY-MM
      const payload = {
        ...value,
        month_year: `${selectedYear}-${selectedMonth}`,
      };

      if (isEditing && budget) {
        updateBudgetMutation.mutate(
          { budgetId: budget.id, payload },
          {
            onSuccess: () => {
              form.reset();
              onClose();
            },
          }
        );
      } else {
        createBudgetMutation.mutate(payload, {
          onSuccess: () => {
            form.reset();
            onClose();
          },
        });
      }
    },
  });

  // Reset or fill form values when budget changes
  useEffect(() => {
    if (isOpen) {
      if (budget) {
        form.setFieldValue("category", budget.category);
        const amt = Math.round(Number(budget.amount)) || 0;
        form.setFieldValue("amount", amt);
        setTimeout(() => {
          setAmountInput(amt === 0 ? "0" : amt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        }, 0);

        // Parse month_year format (handles YYYY-MM and MM-YYYY)
        if (budget.month_year && budget.month_year.includes("-")) {
          const parts = budget.month_year.split("-");
          setTimeout(() => {
            if (parts[0].length === 4) {
              // YYYY-MM
              setSelectedYear(parts[0]);
              setSelectedMonth(parts[1]);
            } else {
              // MM-YYYY
              setSelectedMonth(parts[0]);
              setSelectedYear(parts[1]);
            }
          }, 0);
          form.setFieldValue("month_year", budget.month_year);
        }
      } else {
        form.reset();
        const m = String(new Date().getMonth() + 1).padStart(2, "0");
        const y = String(new Date().getFullYear());
        setTimeout(() => {
          setSelectedMonth(m);
          setSelectedYear(y);
          setAmountInput("");
        }, 0);
        form.setFieldValue("month_year", `${y}-${m}`);
      }
    }
  }, [isOpen, budget, form]);

  // Keep form value in sync when selectedMonth or selectedYear changes
  useEffect(() => {
    form.setFieldValue("month_year", `${selectedYear}-${selectedMonth}`);
  }, [selectedMonth, selectedYear, form]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white border border-zinc-150 rounded-2xl w-full max-w-md shadow-xl overflow-hidden relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4.5 right-4.5 p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <X className="size-4.5" />
              </button>

              {/* Dialog Header */}
              <div className="px-6 pt-6 pb-4 border-b border-zinc-100 text-left">
                <h3 className="text-lg font-bold text-zinc-900">
                  {isEditing ? "Edit Budget" : "Add New Budget"}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {isEditing ? "Modify your budget limit below" : "Define a spending limit for a specific category"}
                </p>
              </div>

              {/* Dialog Form Body */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="p-6 space-y-4 text-left"
              >
                {/* Category Name Field */}
                <form.Field
                  name="category"
                  children={(field) => {
                    const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                    return (
                      <div className="space-y-1.5">
                        <Label htmlFor={field.name} className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none">
                          Category Name
                        </Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g. Vape, Bensin, Makanan, Liburan"
                          className={cn(
                            "rounded-xl border border-zinc-200 bg-white h-11 px-4 text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm",
                            hasError && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                        <AnimatePresence>
                          {hasError && (
                            <motion.p
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.15, ease: "easeOut" }}
                              className="text-xs text-destructive font-medium mt-1 px-1"
                            >
                              {field.state.meta.errors
                                .map((err: unknown) =>
                                  err && typeof err === "object" && "message" in err
                                    ? (err as { message: string }).message
                                    : String(err)
                                )
                                .join(", ")}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }}
                />

                {/* Limit / Budget Amount Field */}
                <form.Field
                  name="amount"
                  children={(field) => {
                    const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                    return (
                      <div className="space-y-1.5">
                        <Label htmlFor={field.name} className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none">
                          Budget Limit
                        </Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 select-none">
                            Rp
                          </span>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="text"
                            value={amountInput}
                            onBlur={field.handleBlur}
                            onChange={(e) => handleAmountChange(e, field.handleChange)}
                            placeholder="0"
                            className={cn(
                              "rounded-xl border border-zinc-200 bg-white h-11 pl-10 pr-4 text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm",
                              hasError && "border-destructive focus-visible:ring-destructive"
                            )}
                          />
                        </div>
                        <AnimatePresence>
                          {hasError && (
                            <motion.p
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.15, ease: "easeOut" }}
                              className="text-xs text-destructive font-medium mt-1 px-1"
                            >
                              {field.state.meta.errors
                                .map((err: unknown) =>
                                  err && typeof err === "object" && "message" in err
                                    ? (err as { message: string }).message
                                    : String(err)
                                )
                                .join(", ")}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }}
                />

                {/* Month/Year Selection Field */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none">
                    Budget Period
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Month Dropdown */}
                    <div className="relative">
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="rounded-xl border border-zinc-200 bg-white h-11 px-4 text-sm w-full focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 shadow-sm appearance-none cursor-pointer"
                      >
                        {MONTHS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>

                    {/* Year Dropdown */}
                    <div className="relative">
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="rounded-xl border border-zinc-200 bg-white h-11 px-4 text-sm w-full focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 shadow-sm appearance-none cursor-pointer"
                      >
                        {yearOptions.map((y) => (
                          <option key={y.value} value={y.value}>
                            {y.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isPending}
                    className="rounded-xl px-5 h-10 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-all font-medium text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>

                  <form.Subscribe
                    selector={(state) => [state.canSubmit]}
                    children={([canSubmit]) => (
                      <Button
                        type="submit"
                        disabled={!canSubmit || isPending}
                        className="rounded-xl px-6 h-10 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <span>{isEditing ? "Save Changes" : "Create Budget"}</span>
                        )}
                      </Button>
                    )}
                  />
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { reminderSchema } from "../api/reminder.contract";
import { useCreateReminderMutation, useUpdateReminderMutation } from "../api/reminder.mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X, Calendar, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { BottomSheet, useIsMobile } from "@/components/ui/bottom-sheet";
import type { Reminder } from "../api/reminder.contract";
import { createPortal } from "react-dom";

interface DayPickerProps {
  value: number;
  onChange: (val: number) => void;
}

function DayPicker({ value, onChange }: DayPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const isMobile = useIsMobile();

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between gap-2.5 rounded-xl border border-zinc-200 bg-white h-11 px-4 text-sm w-full text-left focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 shadow-sm transition-all cursor-pointer select-none",
          isOpen && "ring-1 ring-zinc-950 border-zinc-950"
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Calendar className="size-4 text-zinc-400 shrink-0 pointer-events-none" />
          <span className="font-semibold text-zinc-900">{value || 1}</span>
        </div>
        <ChevronDown className={cn("size-4 text-zinc-400 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && !isMobile && (
        <>
          <div className="fixed inset-0 z-45 cursor-default" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-12.5 z-50 bg-white border border-zinc-150 rounded-2xl p-4 shadow-lg flex flex-col gap-3 select-none w-72 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-center pb-1.5 border-b border-zinc-100">
              <span className="font-bold text-sm text-zinc-800">Select Day</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((day) => {
                const isSelected = value === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      onChange(day);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "size-8 text-xs font-semibold rounded-lg flex items-center justify-center transition-all cursor-pointer border-0",
                      isSelected
                        ? "bg-zinc-900 text-white shadow-sm hover:bg-zinc-850"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 bg-transparent"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <BottomSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Select Due Day"
        >
          <div className="flex justify-center w-full pb-4">
            <div className="w-72 bg-white flex flex-col gap-3 select-none">
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                  const isSelected = value === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        onChange(day);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "size-8.5 text-xs.5 font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer border border-transparent",
                        isSelected
                          ? "bg-zinc-900 text-white shadow-md font-bold"
                          : "text-zinc-700 bg-zinc-50 hover:bg-zinc-100 hover:text-zinc-900"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

interface ReminderFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reminder?: Reminder | null; // If provided, we are editing
}

export function ReminderFormDialog({ isOpen, onClose, reminder }: ReminderFormDialogProps) {
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
              className="bg-white border border-zinc-150 rounded-2xl w-full max-w-md shadow-xl relative"
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
                  {reminder ? "Edit Reminder" : "Add New Reminder"}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {reminder ? "Modify your reminder details below" : "Set up a recurring monthly bill reminder"}
                </p>
              </div>

              {/* Form Content - Mounted fresh per selected reminder */}
              <ReminderForm
                key={reminder?.id || "new"}
                reminder={reminder}
                onClose={onClose}
              />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

interface ReminderFormProps {
  reminder?: Reminder | null;
  onClose: () => void;
}

function ReminderForm({ reminder, onClose }: ReminderFormProps) {
  const createReminderMutation = useCreateReminderMutation();
  const updateReminderMutation = useUpdateReminderMutation();

  const isEditing = !!reminder;
  const isPending = createReminderMutation.isPending || updateReminderMutation.isPending;

  // Local state for currency formatted display
  const [amountInput, setAmountInput] = useState(() => {
    if (reminder) {
      const amt = Math.round(Number(reminder.amount)) || 0;
      return amt === 0 ? "0" : amt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    return "";
  });

  const handleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    handleChange: (v: number) => void
  ) => {
    const input = e.target;
    const rawVal = input.value;
    const selectionStart = input.selectionStart || 0;

    const valBeforeCursor = rawVal.substring(0, selectionStart);
    const digitsBeforeCursor = valBeforeCursor.replace(/\D/g, "").length;

    const cleanVal = rawVal.replace(/\D/g, "");
    const numericVal = cleanVal === "" ? null : Number(cleanVal);
    const formattedVal = cleanVal === "" ? "" : cleanVal.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    setAmountInput(formattedVal);
    handleChange(numericVal as unknown as number);

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

  const form = useForm({
    defaultValues: {
      description: reminder?.description || "",
      amount: reminder ? Math.round(Number(reminder.amount)) : (null as unknown as number),
      day_of_month: reminder ? Number(reminder.day_of_month) : 1,
      is_active: reminder ? !!reminder.is_active : true,
    },
    validators: {
      onChange: reminderSchema,
    },
    onSubmit: async ({ value }) => {
      if (isEditing && reminder) {
        updateReminderMutation.mutate(
          { reminderId: reminder.id, payload: value },
          {
            onSuccess: () => {
              form.reset();
              onClose();
            },
          }
        );
      } else {
        createReminderMutation.mutate(value, {
          onSuccess: () => {
            form.reset();
            onClose();
          },
        });
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="p-6 space-y-4 text-left"
    >
      {/* Description Field */}
      <form.Field
        name="description"
        children={(field) => {
          const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
          return (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none">
                Description
              </Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. Pembayaran Spotify, Tagihan Listrik"
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

      {/* Amount Field */}
      <form.Field
        name="amount"
        children={(field) => {
          const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
          return (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none">
                Billing Amount
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

      {/* Day of Month Field */}
      <form.Field
        name="day_of_month"
        children={(field) => {
          const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
          return (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none">
                Due Day of Month (1 - 31)
              </Label>
              <DayPicker
                value={field.state.value}
                onChange={field.handleChange}
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

      {/* Is Active Checkbox Field */}
      <form.Field
        name="is_active"
        children={(field) => {
          return (
            <div className="flex items-center justify-between py-3 border-b border-t border-zinc-100 select-none">
              <div className="space-y-0.5 text-left">
                <label htmlFor={field.name} className="text-sm font-semibold text-zinc-900 cursor-pointer">
                  Active Reminder
                </label>
                <p className="text-[11px] text-zinc-400">
                  Receive notifications and track this bill on dashboard.
                </p>
              </div>
              <input
                type="checkbox"
                id={field.name}
                checked={!!field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="accent-zinc-900 h-5 w-5 rounded border-zinc-300 cursor-pointer shadow-sm shrink-0"
              />
            </div>
          );
        }}
      />

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
                <span>{isEditing ? "Save Changes" : "Create Reminder"}</span>
              )}
            </Button>
          )}
        />
      </div>
    </form>
  );
}

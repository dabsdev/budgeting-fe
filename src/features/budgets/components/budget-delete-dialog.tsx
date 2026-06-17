import { useDeleteBudgetMutation } from "../api/budget.mutations";
import { Button } from "@/components/ui/button";
import { Loader2, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Budget } from "../api/budget.contract";
import { createPortal } from "react-dom";
import { useEffect } from "react";

interface BudgetDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
}

export function BudgetDeleteDialog({ isOpen, onClose, budget }: BudgetDeleteDialogProps) {
  const deleteBudgetMutation = useDeleteBudgetMutation();

  const handleConfirmDelete = () => {
    if (!budget) return;
    deleteBudgetMutation.mutate(budget.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  useEffect(() => {
    if (isOpen && budget) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, budget]);

  return createPortal(
    <AnimatePresence>
      {isOpen && budget && (
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
              className="bg-white border border-zinc-150 rounded-2xl w-full max-w-sm shadow-xl overflow-hidden relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4.5 right-4.5 p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <X className="size-4.5" />
              </button>

              {/* Dialog Content */}
              <div className="p-6 text-center space-y-4">
                {/* Warning Icon Banner */}
                <div className="mx-auto size-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
                  <AlertTriangle className="size-5.5" />
                </div>

                <div className="space-y-1.5 text-center">
                  <h3 className="text-lg font-bold text-zinc-900">Delete Budget</h3>
                  <p className="text-xs text-zinc-500 max-w-[280px] mx-auto leading-relaxed">
                    Are you sure you want to delete <span className="font-semibold text-zinc-800">"{budget.category}"</span> budget for period <span className="font-semibold text-zinc-800">"{budget.month_year}"</span>? This action cannot be undone.
                  </p>
                </div>

                {/* Dialog Footer Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 mt-6 select-none">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={deleteBudgetMutation.isPending}
                    className="flex-1 rounded-xl h-10 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-all font-medium text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    onClick={handleConfirmDelete}
                    disabled={deleteBudgetMutation.isPending}
                    className="flex-1 rounded-xl h-10 bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {deleteBudgetMutation.isPending ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <span>Delete</span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

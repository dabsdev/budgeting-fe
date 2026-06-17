import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createBudget, updateBudget, deleteBudget } from "./budget.api";
import { BUDGETS_QUERY_KEY } from "./budget.queries";
import type { CreateBudgetInput, UpdateBudgetInput } from "./budget.contract";

export function useCreateBudgetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBudgetInput) => createBudget(payload),
    onSuccess: (response) => {
      toast.success(response.message || "Budget created successfully", {
        position: "bottom-right",
      });
      void queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create budget", {
        position: "bottom-right",
      });
    },
  });
}

export function useUpdateBudgetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ budgetId, payload }: { budgetId: string; payload: UpdateBudgetInput }) =>
      updateBudget(budgetId, payload),
    onSuccess: (response) => {
      toast.success(response.message || "Budget updated successfully", {
        position: "bottom-right",
      });
      void queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update budget", {
        position: "bottom-right",
      });
    },
  });
}

export function useDeleteBudgetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (budgetId: string) => deleteBudget(budgetId),
    onSuccess: () => {
      toast.success("Budget deleted successfully", {
        position: "bottom-right",
      });
      void queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete budget", {
        position: "bottom-right",
      });
    },
  });
}

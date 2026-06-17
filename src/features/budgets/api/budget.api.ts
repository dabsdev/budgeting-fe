import { apiFetch } from "@/lib/http";
import type { Budget, CreateBudgetInput, UpdateBudgetInput } from "./budget.contract";

export async function getBudgets(params?: { page?: number; limit?: number; month_year?: string }) {
  return await apiFetch<Budget[]>("/budgets", {
    method: "GET",
    params,
  });
}

export async function createBudget(payload: CreateBudgetInput) {
  return await apiFetch<Budget>("/budgets", {
    method: "POST",
    json: payload,
  });
}

export async function updateBudget(budgetId: string, payload: UpdateBudgetInput) {
  return await apiFetch<Budget>(`/budgets/${budgetId}`, {
    method: "PUT",
    json: payload,
  });
}

export async function deleteBudget(budgetId: string) {
  return await apiFetch<null>(`/budgets/${budgetId}`, {
    method: "DELETE",
  });
}

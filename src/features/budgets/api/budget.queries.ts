import { useQuery } from "@tanstack/react-query";
import { getBudgets } from "./budget.api";

export const BUDGETS_QUERY_KEY = ["budgets"];

export function useBudgetsQuery(params?: { page?: number; limit?: number; month_year?: string }) {
  return useQuery({
    queryKey: [...BUDGETS_QUERY_KEY, params],
    queryFn: () => getBudgets(params),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
}

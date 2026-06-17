import { useQuery } from "@tanstack/react-query";
import { getTransactions, type GetTransactionsParams } from "./transaction.api";

export const TRANSACTIONS_QUERY_KEY = ["transactions"];

export function useTransactionsQuery(params?: GetTransactionsParams) {
  return useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, params],
    queryFn: () => getTransactions(params),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
}

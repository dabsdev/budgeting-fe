import { useQuery } from "@tanstack/react-query";
import { getWallets } from "./wallet.api";

export const WALLETS_QUERY_KEY = ["wallets"];

export function useWalletsQuery(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...WALLETS_QUERY_KEY, params],
    queryFn: () => getWallets(params),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
}

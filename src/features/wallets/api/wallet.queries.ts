import { useQuery } from "@tanstack/react-query";
import { getWallets } from "./wallet.api";

export const WALLETS_QUERY_KEY = ["wallets"];

export function useWalletsQuery() {
  return useQuery({
    queryKey: WALLETS_QUERY_KEY,
    queryFn: () => getWallets(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
}

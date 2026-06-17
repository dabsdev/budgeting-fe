import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createWallet, updateWallet, deleteWallet } from "./wallet.api";
import { WALLETS_QUERY_KEY } from "./wallet.queries";
import { DASHBOARD_SUMMARY_QUERY_KEY } from "@/features/dashboard/api/dashboard.queries";
import type { CreateWalletInput, UpdateWalletInput } from "./wallet.contract";

export function useCreateWalletMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWalletInput) => createWallet(payload),
    onSuccess: (response) => {
      // Invalidate wallets list and dashboard summary (which recalculates net worth)
      void queryClient.invalidateQueries({ queryKey: WALLETS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_SUMMARY_QUERY_KEY });
      toast.success(response.message || "Wallet created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create wallet. Please try again.");
    },
  });
}

export function useUpdateWalletMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ walletId, payload }: { walletId: string; payload: UpdateWalletInput }) =>
      updateWallet(walletId, payload),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: WALLETS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_SUMMARY_QUERY_KEY });
      toast.success(response.message || "Wallet updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update wallet. Please try again.");
    },
  });
}

export function useDeleteWalletMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (walletId: string) => deleteWallet(walletId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WALLETS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_SUMMARY_QUERY_KEY });
      toast.success("Wallet deleted successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete wallet. Please try again.");
    },
  });
}

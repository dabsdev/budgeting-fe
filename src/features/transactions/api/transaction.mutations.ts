import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createTransfer,
} from "./transaction.api";
import { TRANSACTIONS_QUERY_KEY } from "./transaction.queries";
import { WALLETS_QUERY_KEY } from "@/features/wallets/api/wallet.queries";
import { BUDGETS_QUERY_KEY } from "@/features/budgets/api/budget.queries";
import { DASHBOARD_SUMMARY_QUERY_KEY } from "@/features/dashboard/api/dashboard.queries";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  CreateTransferInput,
} from "./transaction.contract";

export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTransactionInput) => createTransaction(payload),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: WALLETS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_SUMMARY_QUERY_KEY });
      toast.success(response.message || "Transaction created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create transaction.");
    },
  });
}

export function useUpdateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      payload,
    }: {
      transactionId: string;
      payload: UpdateTransactionInput;
    }) => updateTransaction(transactionId, payload),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: WALLETS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_SUMMARY_QUERY_KEY });
      toast.success(response.message || "Transaction updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update transaction.");
    },
  });
}

export function useDeleteTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) => deleteTransaction(transactionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: WALLETS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_SUMMARY_QUERY_KEY });
      toast.success("Transaction deleted successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete transaction.");
    },
  });
}

export function useCreateTransferMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTransferInput) => createTransfer(payload),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: WALLETS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_SUMMARY_QUERY_KEY });
      toast.success(response.message || "Transfer completed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete transfer.");
    },
  });
}

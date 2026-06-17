import { apiFetch } from "@/lib/http";
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  CreateTransferInput,
} from "./transaction.contract";

export interface GetTransactionsParams {
  page?: number;
  limit?: number;
  wallet_id?: string;
  type?: "IN" | "OUT" | "TRANSFER";
  year_month?: string;
  search?: string;
}

export async function getTransactions(params?: GetTransactionsParams) {
  return await apiFetch<Transaction[]>("/transactions", {
    method: "GET",
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

export async function createTransaction(payload: CreateTransactionInput) {
  return await apiFetch<Transaction>("/transactions", {
    method: "POST",
    json: payload,
  });
}

export async function updateTransaction(transactionId: string, payload: UpdateTransactionInput) {
  return await apiFetch<Transaction>(`/transactions/${transactionId}`, {
    method: "PUT",
    json: payload,
  });
}

export async function deleteTransaction(transactionId: string) {
  return await apiFetch<null>(`/transactions/${transactionId}`, {
    method: "DELETE",
  });
}

export async function createTransfer(payload: CreateTransferInput) {
  // Returns the source transaction in data.outTx and dest in data.inTx
  return await apiFetch<{ outTx: Transaction; inTx: Transaction }>("/transactions/transfer", {
    method: "POST",
    json: payload,
  });
}

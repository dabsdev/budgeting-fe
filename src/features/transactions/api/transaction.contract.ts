import { z } from "zod";

export const transactionSchema = z.object({
  wallet_id: z.string().min(1, "Wallet is required"),
  budget_id: z.string().nullable(),
  type: z.enum(["IN", "OUT"], { message: "Type must be IN or OUT" }),
  description: z.string().min(1, "Description is required").max(200, "Description is too long"),
  amount: z.number({ message: "Amount is required" }).min(1, "Amount must be greater than 0"),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export const transferSchema = z.object({
  source_wallet_id: z.string().min(1, "Source wallet is required"),
  destination_wallet_id: z.string().min(1, "Destination wallet is required"),
  amount: z.number({ message: "Amount is required" }).min(1, "Amount must be greater than 0"),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
}).refine(data => data.source_wallet_id !== data.destination_wallet_id, {
  message: "Source and destination wallets must be different",
  path: ["destination_wallet_id"],
});

export type CreateTransactionInput = z.infer<typeof transactionSchema>;
export type UpdateTransactionInput = z.infer<typeof transactionSchema>;
export type CreateTransferInput = z.infer<typeof transferSchema>;

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  budget_id: string | null;
  type: "IN" | "OUT";
  description: string;
  amount: number;
  transaction_date: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  linked_transaction_id: string | null;
  wallet: {
    id: string;
    name: string;
  };
  budget: {
    id: string;
    category: string;
  } | null;
  linked_transaction?: {
    id: string | null;
    wallet_id: string | null;
    wallet_name: string | null;
  } | null;
}

export interface GetTransactionsResponse {
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
}

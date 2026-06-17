import { apiFetch } from "@/lib/http";
import type { Wallet, CreateWalletInput, UpdateWalletInput } from "./wallet.contract";

export async function getWallets(params?: { page?: number; limit?: number }) {
  return await apiFetch<Wallet[]>("/wallets", {
    method: "GET",
    params,
  });
}

export async function createWallet(payload: CreateWalletInput) {
  return await apiFetch<Wallet>("/wallets", {
    method: "POST",
    json: payload,
  });
}

export async function updateWallet(walletId: string, payload: UpdateWalletInput) {
  return await apiFetch<Wallet>(`/wallets/${walletId}`, {
    method: "PUT",
    json: payload,
  });
}

export async function deleteWallet(walletId: string) {
  return await apiFetch<null>(`/wallets/${walletId}`, {
    method: "DELETE",
  });
}

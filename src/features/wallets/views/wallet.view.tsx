import { useState } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { useWalletsQuery } from "../api/wallet.queries";
import { WalletFormDialog } from "../components/wallet-form-dialog";
import { WalletDeleteDialog } from "../components/wallet-delete-dialog";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  Wallet as WalletIcon,
  AlertCircle,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Wallet } from "../api/wallet.contract";

export function WalletView() {
  const search = useSearch({ strict: false }) as Record<string, string | number | undefined>;
  const navigate = useNavigate();

  // Extract pagination values from search parameters
  const page = Number(search.page) || 1;
  const limit = Number(search.limit) || 10;

  // Fetch wallets list
  const { data: response, isLoading, isError, error, refetch } = useWalletsQuery({ page, limit });
  const wallets = response?.data || [];
  const pagination = response?.pagination;

  // Modal Dialog local states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

  const handleAddClick = () => {
    setSelectedWallet(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setIsDeleteOpen(true);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      void navigate({
        to: "/wallets",
        search: {
          page: page - 1,
          limit,
        },
      });
    }
  };

  const handleNextPage = () => {
    if (pagination?.hasNextPage) {
      void navigate({
        to: "/wallets",
        search: {
          page: page + 1,
          limit,
        },
      });
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 border border-dashed border-red-200 bg-red-50/10 rounded-2xl text-center max-w-2xl mx-auto my-12">
        <AlertCircle className="size-10 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-zinc-900 mb-1">Failed to load wallets</h3>
        <p className="text-sm text-zinc-500 mb-4">{(error as Error)?.message || "Something went wrong."}</p>
        <button
          onClick={() => refetch()}
          className="rounded-full px-6 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold cursor-pointer shadow"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Wallets</h1>
          <p className="text-sm text-zinc-500 mt-1 select-none">
            Manage your accounts, cards, and cash balances here.
          </p>
        </div>

        <button
          onClick={handleAddClick}
          className="rounded-xl px-5 h-11 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="size-4" />
          <span>Add Wallet</span>
        </button>
      </div>

      {/* Main Content (List / Grid) */}
      {isLoading ? (
        // Pulsing Loading Skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-5 w-32 bg-zinc-200 rounded-md" />
                <div className="h-8 w-44 bg-zinc-200 rounded-md" />
              </div>
              <div className="h-4 w-24 bg-zinc-200 rounded-md" />
            </div>
          ))}
        </div>
      ) : wallets.length === 0 ? (
        // Empty State Banner
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-250/70 rounded-2xl bg-white shadow-sm max-w-xl mx-auto text-center select-none">
          <div className="size-14 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 mb-4">
            <FolderOpen className="size-6.5" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 mb-1">No wallets found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mb-6 leading-relaxed">
            You haven't added any wallets yet. Create a wallet to start recording your transactions and managing your budget.
          </p>
          <button
            onClick={handleAddClick}
            className="rounded-xl px-6 h-10 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="size-4" />
            <span>Create First Wallet</span>
          </button>
        </div>
      ) : (
        // Wallets Card Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => {
            const formattedDate = new Date(wallet.created_at).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={wallet.id}
                className="group relative bg-white border border-zinc-150 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-zinc-300 hover:shadow-md transition-all h-40"
              >
                {/* Header Section */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
                        <WalletIcon className="size-3.5" />
                      </div>
                      <h3 className="font-semibold text-zinc-900 text-sm truncate max-w-[150px]">
                        {wallet.name}
                      </h3>
                    </div>
                    {/* Amount */}
                    <div className="pt-2">
                      <span className="text-2xl font-bold tracking-tight text-zinc-900">
                        {formatCurrency(Number(wallet.balance) || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Card Action Buttons (Visible always on mobile, hover-only on desktop) */}
                  <div className="flex items-center gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity select-none shrink-0">
                    <button
                      onClick={() => handleEditClick(wallet)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-all cursor-pointer"
                      title="Edit Wallet"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(wallet)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50/20 border border-transparent hover:border-red-100/30 transition-all cursor-pointer"
                      title="Delete Wallet"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 select-none">
                  <span>Created {formattedDate}</span>
                  <span className="bg-zinc-50 px-2 py-0.5 rounded-md font-semibold text-zinc-500 border border-zinc-100/50">
                    Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && wallets.length > 0 && pagination && (
        <div className="flex items-center justify-between pt-4 border-t border-zinc-150 mt-8 select-none">
          <span className="text-xs font-semibold text-zinc-500">
            Page {page}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={page <= 1}
              className="size-9 rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronLeft className="size-4 text-zinc-700" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage}
              className="size-9 rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronRight className="size-4 text-zinc-700" />
            </button>
          </div>
        </div>
      )}

      {/* Dialog Modals */}
      <WalletFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        wallet={selectedWallet}
      />

      <WalletDeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        wallet={selectedWallet}
      />
    </div>
  );
}

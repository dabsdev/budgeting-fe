import { useState } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { useWalletsQuery } from "../api/wallet.queries";
import { WalletFormDialog } from "../components/wallet-form-dialog";
import { WalletDeleteDialog } from "../components/wallet-delete-dialog";
import { formatCurrency, cn } from "@/lib/utils";
import { Route as AuthRoute } from "@/routes/_auth";
import {
  Plus,
  Pencil,
  Trash2,
  Wallet as WalletIcon,
  AlertCircle,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  Layers,
  CreditCard,
} from "lucide-react";
import type { Wallet } from "../api/wallet.contract";

// helper method to retrieve card theme based on wallet name
const getCardTheme = (name: string) => {
  const cleanName = name.toLowerCase();
  if (cleanName.includes("bca")) {
    return {
      bg: "bg-gradient-to-br from-blue-700 via-indigo-900 to-zinc-950",
      text: "text-white",
      mutedText: "text-blue-300",
      accentBg: "bg-blue-500/20 text-blue-200 border border-blue-400/20",
      accentBorder: "border-blue-500/20",
      chip: "bg-gradient-to-br from-yellow-250 via-amber-400 to-yellow-350",
      gloss: "from-blue-500/15 to-transparent",
    };
  }
  if (cleanName.includes("jago")) {
    return {
      bg: "bg-gradient-to-br from-amber-500 via-orange-650 to-amber-950",
      text: "text-white",
      mutedText: "text-amber-100/80",
      accentBg: "bg-amber-400/20 text-amber-100 border border-amber-300/20",
      accentBorder: "border-amber-500/20",
      chip: "bg-gradient-to-br from-zinc-200 via-zinc-400 to-zinc-300",
      gloss: "from-amber-400/20 to-transparent",
    };
  }
  if (cleanName.includes("mandiri")) {
    return {
      bg: "bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-950",
      text: "text-white",
      mutedText: "text-zinc-400",
      accentBg: "bg-yellow-500/20 text-yellow-300 border border-yellow-400/20",
      accentBorder: "border-zinc-800",
      chip: "bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-450",
      gloss: "from-blue-500/10 to-transparent",
    };
  }
  if (cleanName.includes("bni")) {
    return {
      bg: "bg-gradient-to-br from-teal-700 via-emerald-850 to-slate-950",
      text: "text-white",
      mutedText: "text-teal-200/80",
      accentBg: "bg-teal-500/20 text-teal-100 border border-teal-400/20",
      accentBorder: "border-teal-500/20",
      chip: "bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-300",
      gloss: "from-teal-400/15 to-transparent",
    };
  }
  if (cleanName.includes("cash") || cleanName.includes("tunai") || cleanName.includes("dompet")) {
    return {
      bg: "bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-950",
      text: "text-white",
      mutedText: "text-emerald-200/80",
      accentBg: "bg-emerald-500/20 text-emerald-100 border border-emerald-400/20",
      accentBorder: "border-emerald-500/20",
      chip: "bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-300",
      gloss: "from-emerald-400/15 to-transparent",
    };
  }
  return {
    bg: "bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950",
    text: "text-white",
    mutedText: "text-zinc-400",
    accentBg: "bg-zinc-800 text-zinc-300 border border-zinc-700",
    accentBorder: "border-zinc-800",
    chip: "bg-gradient-to-br from-zinc-300 via-zinc-500 to-zinc-400",
    gloss: "from-zinc-500/10 to-transparent",
  };
};

export function WalletView() {
  const user = AuthRoute.useLoaderData();
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

  // Compute stats
  const totalBalance = wallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);
  const primaryWallet = wallets.length > 0
    ? [...wallets].sort((a, b) => Number(b.balance) - Number(a.balance))[0]
    : null;

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

      {/* Overview Stats Banner */}
      {!isLoading && wallets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 animate-in fade-in duration-300">
          <div className="bg-white border border-zinc-150 rounded-2xl p-5 flex items-center gap-4 shadow-xs select-none">
            <div className="size-11 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
              <PiggyBank className="size-5.5" />
            </div>
            <div className="space-y-0.5 text-left min-w-0">
              <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">Total Balance</span>
              <h4 className="text-lg font-bold text-zinc-900 tracking-tight truncate">
                {formatCurrency(totalBalance)}
              </h4>
            </div>
          </div>

          <div className="bg-white border border-zinc-150 rounded-2xl p-5 flex items-center gap-4 shadow-xs select-none">
            <div className="size-11 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
              <Layers className="size-5.5" />
            </div>
            <div className="space-y-0.5 text-left min-w-0">
              <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">Total Accounts</span>
              <h4 className="text-lg font-bold text-zinc-900 tracking-tight truncate">
                {wallets.length} <span className="text-xs text-zinc-400 font-normal">wallet(s)</span>
              </h4>
            </div>
          </div>

          <div className="bg-white border border-zinc-150 rounded-2xl p-5 flex items-center gap-4 shadow-xs select-none">
            <div className="size-11 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
              <WalletIcon className="size-5.5" />
            </div>
            <div className="space-y-0.5 text-left min-w-0">
              <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">Primary Source</span>
              <h4 className="text-lg font-bold text-zinc-900 tracking-tight truncate" title={primaryWallet?.name}>
                {primaryWallet?.name || "None"}
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Main Content (List / Grid) */}
      {isLoading ? (
        // Pulsing Loading Skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-52 bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-5 w-28 bg-zinc-200 rounded-md" />
                  <div className="h-3 w-14 bg-zinc-200 rounded-md" />
                </div>
                <div className="h-6 w-14 bg-zinc-200 rounded-md" />
              </div>
              <div className="h-6 w-16 bg-zinc-200 rounded-sm my-4" />
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-zinc-200 rounded-md" />
                  <div className="h-4 w-24 bg-zinc-200 rounded-md" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-12 bg-zinc-200 rounded-md" />
                  <div className="h-5 w-20 bg-zinc-200 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : wallets.length === 0 ? (
        // Empty State Banner
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-250/70 rounded-2xl bg-white shadow-xs max-w-xl mx-auto text-center select-none">
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
        // Wallets Credit Card Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => {
            const formattedDate = new Date(wallet.created_at).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            // Format card expiry or display date: MM/YY
            const createdDate = new Date(wallet.created_at);
            const mm = String(createdDate.getMonth() + 1).padStart(2, "0");
            const yy = String(createdDate.getFullYear()).slice(-2);
            const expiryFormat = `${mm}/${yy}`;

            // Generate a deterministic 4-digit card number ending from the wallet ID
            const numericHash = wallet.id.split("-").join("").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const last4Digits = String(numericHash % 10000).padStart(4, "0");

            const theme = getCardTheme(wallet.name);

            return (
              <div
                key={wallet.id}
                className={cn(
                  "group relative rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 h-52 flex flex-col justify-between overflow-hidden border text-left",
                  theme.bg,
                  theme.text,
                  theme.accentBorder
                )}
              >
                {/* Shiny gloss overlay */}
                <div className={cn("absolute inset-0 bg-gradient-to-tr opacity-25 pointer-events-none", theme.gloss)} />
                
                {/* Abstract geometric card patterns */}
                <div className="absolute -right-10 -bottom-10 size-40 rounded-full bg-white/5 blur-2xl pointer-events-none group-hover:bg-white/10 transition-all duration-500" />
                <div className="absolute -left-10 -top-10 size-40 rounded-full bg-white/5 blur-2xl pointer-events-none group-hover:bg-white/10 transition-all duration-500" />

                {/* Top Row: Card Brand & Type */}
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                      <CreditCard className="size-4 text-white" />
                    </div>
                    <span className="font-bold text-sm tracking-wide truncate pr-2">
                      {wallet.name}
                    </span>
                  </div>
                  <span className={cn("text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full select-none shrink-0", theme.accentBg)}>
                    DEBIT
                  </span>
                </div>

                {/* Middle Row: Chip & Number */}
                <div className="space-y-2 relative z-10 my-auto">
                  {/* Card Chip graphic */}
                  <div className="w-8.5 h-6.5 rounded bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-300 relative overflow-hidden shadow-inner border border-amber-400/30">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-amber-900/20" />
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-amber-900/20" />
                    <div className="absolute inset-1.5 rounded-sm border border-amber-900/10" />
                  </div>
                  {/* Masked Card Number */}
                  <div className="text-sm tracking-[0.25em] font-mono opacity-80 font-medium select-none">
                    •••• •••• •••• {last4Digits}
                  </div>
                </div>

                {/* Bottom Row: Holder Name, Expiry, & Balance */}
                <div className="flex items-end justify-between relative z-10 gap-2">
                  <div className="space-y-0.5 text-left min-w-0 flex-1">
                    <span className={cn("text-[8px] uppercase tracking-wider font-semibold block opacity-85", theme.mutedText)}>
                      Card Holder
                    </span>
                    <span className="text-[11px] font-semibold tracking-wide block truncate uppercase font-mono">
                      {user?.name || "Budgeting User"}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-center shrink-0 px-2 hidden sm:block" title={`Created on ${formattedDate}`}>
                    <span className={cn("text-[8px] uppercase tracking-wider font-semibold block opacity-85", theme.mutedText)}>
                      Expires
                    </span>
                    <span className="text-[11px] font-semibold tracking-wide block font-mono">
                      {expiryFormat}
                    </span>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className={cn("text-[8px] uppercase tracking-wider font-semibold block opacity-85", theme.mutedText)}>
                      Balance
                    </span>
                    <span className="text-xl font-bold tracking-tight block">
                      {formatCurrency(Number(wallet.balance) || 0)}
                    </span>
                  </div>
                </div>

                {/* Hover actions panel */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 translate-y-[-6px] group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(wallet);
                    }}
                    className="size-8 rounded-xl bg-white/15 hover:bg-white/25 border border-white/10 hover:border-white/25 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-sm"
                    title="Edit Wallet"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(wallet);
                    }}
                    className="size-8 rounded-xl bg-red-500/80 hover:bg-red-500 border border-red-400/20 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-sm"
                    title="Delete Wallet"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
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

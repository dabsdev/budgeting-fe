import { useState } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { useRemindersQuery } from "../api/reminder.queries";
import { ReminderFormDialog } from "../components/reminder-form-dialog";
import { ReminderDeleteDialog } from "../components/reminder-delete-dialog";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Reminder } from "../api/reminder.contract";

export function ReminderView() {
  const search = useSearch({ strict: false }) as Record<string, string | number | undefined>;
  const navigate = useNavigate();

  // Extract pagination values from search parameters
  const page = Number(search.page) || 1;
  const limit = Number(search.limit) || 10;

  // Fetch reminders list
  const { data: response, isLoading, isError, error, refetch } = useRemindersQuery({ page, limit });
  const reminders = response?.data || [];
  const pagination = response?.pagination;



  // Modal Dialog local states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [hoveredReminderId, setHoveredReminderId] = useState<string | null>(null);



  const handleAddClick = () => {
    setSelectedReminder(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setIsDeleteOpen(true);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      void navigate({
        to: "/reminders",
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
        to: "/reminders",
        search: {
          page: page + 1,
          limit,
        },
      });
    }
  };

  const getDaysRemainingText = (dueDay: number) => {
    const todayDay = new Date().getDate();
    if (dueDay === todayDay) return "Due today!";
    if (dueDay > todayDay) {
      const diff = dueDay - todayDay;
      return `Due in ${diff} day${diff > 1 ? "s" : ""}`;
    } else {
      const diff = (dueDay + 30) - todayDay; // simplified month diff
      return `Due in ${diff} day${diff > 1 ? "s" : ""}`;
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 border border-dashed border-red-200 bg-red-50/10 rounded-2xl text-center max-w-2xl mx-auto my-12 animate-in fade-in">
        <AlertCircle className="size-10 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-zinc-900 mb-1">Failed to load reminders</h3>
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
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Recurring Reminders</h1>
          <p className="text-sm text-zinc-500 mt-1 select-none">
            Track and manage your monthly subscriptions and recurring bills.
          </p>
        </div>

        <button
          onClick={handleAddClick}
          className="rounded-xl px-5 h-11 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="size-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Main Content (List / Grid) */}
      {isLoading ? (
        // Pulsing Loading Skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-white border border-zinc-200 rounded-2xl p-5 flex items-center gap-4 justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-14 bg-zinc-200 rounded-lg shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-zinc-200 rounded-md" />
                  <div className="h-3 w-24 bg-zinc-200 rounded-md" />
                </div>
              </div>
              <div className="h-6 w-16 bg-zinc-200 rounded-md shrink-0" />
            </div>
          ))}
        </div>
      ) : reminders.length === 0 ? (
        // Empty State Banner
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-250/70 rounded-2xl bg-white shadow-xs max-w-xl mx-auto text-center select-none animate-in fade-in duration-300">
          <div className="size-14 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 mb-4">
            <FolderOpen className="size-6.5" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 mb-1">No reminders found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mb-6 leading-relaxed">
            You haven't set up any recurring reminders yet. Add bills like subscriptions, rent, or utilities to keep track of your cash commitments.
          </p>
          <button
            onClick={handleAddClick}
            className="rounded-xl px-6 h-10 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="size-4" />
            <span>Create First Reminder</span>
          </button>
        </div>
      ) : (
        // Reminders Calendar Card Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-400">
          {reminders.map((reminder) => {
            const formattedAmount = formatCurrency(Number(reminder.amount) || 0);

            return (
              <div
                key={reminder.id}
                onMouseEnter={() => setHoveredReminderId(reminder.id)}
                onMouseLeave={() => setHoveredReminderId(null)}
                className={cn(
                  "group relative bg-white border border-zinc-150 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4 hover:border-zinc-300 hover:shadow-md transition-all h-32 text-left overflow-hidden",
                  !reminder.is_active && "opacity-75 bg-zinc-50/50"
                )}
              >
                {/* Calendar sheet icon container */}
                <div className="flex items-center gap-4 min-w-0">
                  {/* Calendar Graphic Badge */}
                  <div className="w-12 h-14 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs flex flex-col shrink-0 select-none text-center">
                    <div className={cn(
                      "text-[8px] font-extrabold tracking-wider py-0.5 text-white uppercase transition-colors duration-250",
                      reminder.is_active ? "bg-red-500" : "bg-zinc-400"
                    )}>
                      Due
                    </div>
                    <div className="flex-1 flex items-center justify-center text-lg font-black text-zinc-800 font-mono leading-none">
                      {reminder.day_of_month}
                    </div>
                  </div>

                  {/* Reminder Info */}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-zinc-900 text-sm truncate pr-2">
                      {reminder.description}
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">
                      {reminder.is_active
                        ? getDaysRemainingText(reminder.day_of_month)
                        : "Inactive reminder"}
                    </p>
                    {/* Amount */}
                    <div className="mt-1">
                      <span className="font-bold text-zinc-900 text-sm">
                        {formattedAmount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right actions/toggles section */}
                <div className="flex flex-col items-end justify-between shrink-0 select-none h-14 gap-1">
                  {/* Action Buttons Row: Toggle, Edit, Delete (only shown on hover) */}
                  {hoveredReminderId === reminder.id ? (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-3 duration-250">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditClick(reminder)}
                        className="size-7 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                        title="Edit Reminder"
                      >
                        <Pencil className="size-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteClick(reminder)}
                        className="size-7 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 hover:text-red-700 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                        title="Delete Reminder"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    // Show Active/Inactive status badge when not hovered
                    reminder.is_active ? (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50/50 border border-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1 select-none animate-in fade-in duration-200">
                        <span className="size-1 bg-emerald-500 rounded-full shrink-0" />
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400 font-medium bg-zinc-50 border border-zinc-150 px-2 py-0.5 rounded-full flex items-center gap-1 select-none animate-in fade-in duration-200">
                        <span className="size-1 bg-zinc-300 rounded-full shrink-0" />
                        Inactive
                      </span>
                    )
                  )}

                  {/* Date details */}
                  <span className="text-[9px] bg-zinc-50 border border-zinc-100 text-zinc-400 font-semibold px-2 py-0.5 rounded-md">
                    Monthly
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && reminders.length > 0 && pagination && (
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
      <ReminderFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        reminder={selectedReminder}
      />

      <ReminderDeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        reminder={selectedReminder}
      />
    </div>
  );
}

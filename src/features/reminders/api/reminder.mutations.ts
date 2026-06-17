import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createReminder, updateReminder, deleteReminder } from "./reminder.api";
import { REMINDERS_QUERY_KEY } from "./reminder.queries";
import type { CreateReminderInput, UpdateReminderInput } from "./reminder.contract";

export function useCreateReminderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReminderInput) => createReminder(payload),
    onSuccess: (response) => {
      toast.success(response.message || "Reminder created successfully", {
        position: "bottom-right",
      });
      void queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create reminder", {
        position: "bottom-right",
      });
    },
  });
}

export function useUpdateReminderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reminderId, payload }: { reminderId: string; payload: UpdateReminderInput }) =>
      updateReminder(reminderId, payload),
    onSuccess: (response) => {
      toast.success(response.message || "Reminder updated successfully", {
        position: "bottom-right",
      });
      void queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update reminder", {
        position: "bottom-right",
      });
    },
  });
}

export function useDeleteReminderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reminderId: string) => deleteReminder(reminderId),
    onSuccess: () => {
      toast.success("Reminder deleted successfully", {
        position: "bottom-right",
      });
      void queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete reminder", {
        position: "bottom-right",
      });
    },
  });
}

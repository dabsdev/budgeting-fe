import { apiFetch } from "@/lib/http";
import type { Reminder, CreateReminderInput, UpdateReminderInput } from "./reminder.contract";

export async function getReminders(params?: { page?: number; limit?: number }) {
  return await apiFetch<Reminder[]>("/recurring-reminders", {
    method: "GET",
    params,
  });
}

export async function createReminder(payload: CreateReminderInput) {
  return await apiFetch<Reminder>("/recurring-reminders", {
    method: "POST",
    json: payload,
  });
}

export async function updateReminder(reminderId: string, payload: UpdateReminderInput) {
  return await apiFetch<Reminder>(`/recurring-reminders/${reminderId}`, {
    method: "PUT",
    json: payload,
  });
}

export async function deleteReminder(reminderId: string) {
  return await apiFetch<null>(`/recurring-reminders/${reminderId}`, {
    method: "DELETE",
  });
}

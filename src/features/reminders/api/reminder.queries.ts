import { useQuery } from "@tanstack/react-query";
import { getReminders } from "./reminder.api";

export const REMINDERS_QUERY_KEY = ["recurring-reminders"];

export function useRemindersQuery(params?: { search?: string }) {
  return useQuery({
    queryKey: [...REMINDERS_QUERY_KEY, params],
    queryFn: () => getReminders(params),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
}

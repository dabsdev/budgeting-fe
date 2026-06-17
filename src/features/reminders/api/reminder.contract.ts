import { z } from "zod";

export const reminderSchema = z.object({
  description: z.string().min(1, "Description is required").max(100, "Description is too long"),
  amount: z.number({ message: "Amount is required" }).min(0, "Amount cannot be negative"),
  day_of_month: z.number({ message: "Day of month is required" }).min(1, "Day of month must be between 1 and 31").max(31, "Day of month must be between 1 and 31"),
  is_active: z.boolean(),
});

export type CreateReminderInput = z.infer<typeof reminderSchema>;
export type UpdateReminderInput = z.infer<typeof reminderSchema>;

export interface Reminder {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  day_of_month: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface GetRemindersResponse {
  data: Reminder[];
  pagination: {
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
}

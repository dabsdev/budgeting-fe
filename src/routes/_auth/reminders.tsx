import { createFileRoute } from '@tanstack/react-router'
import { ReminderView } from '@/features/reminders/views/reminder.view'
import { z } from 'zod'

const remindersSearchSchema = z.object({
  page: z.coerce.number().int().positive().optional().catch(1),
  limit: z.coerce.number().int().positive().optional().catch(10),
})

export const Route = createFileRoute('/_auth/reminders')({
  validateSearch: remindersSearchSchema,
  component: ReminderView,
})

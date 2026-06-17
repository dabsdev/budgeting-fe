import { createFileRoute } from '@tanstack/react-router'
import { ReminderView } from '@/features/reminders/views/reminder.view'

export const Route = createFileRoute('/_auth/reminders')({
  component: ReminderView,
})

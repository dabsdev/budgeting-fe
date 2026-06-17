import { createFileRoute } from '@tanstack/react-router'
import { BudgetView } from '@/features/budgets/views/budget.view'
import { z } from 'zod'

const budgetsSearchSchema = z.object({
  page: z.coerce.number().int().positive().optional().catch(1),
  limit: z.coerce.number().int().positive().optional().catch(10),
  month_year: z.string().optional(),
})

export const Route = createFileRoute('/_auth/budgets')({
  validateSearch: budgetsSearchSchema,
  component: BudgetView,
})

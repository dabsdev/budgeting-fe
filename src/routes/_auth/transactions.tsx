import { createFileRoute } from '@tanstack/react-router'
import { TransactionView } from '@/features/transactions/views/transaction.view'

export const Route = createFileRoute('/_auth/transactions')({
  component: TransactionView,
})

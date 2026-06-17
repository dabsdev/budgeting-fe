import { createFileRoute } from '@tanstack/react-router'
import { WalletView } from '@/features/wallets/views/wallet.view'
import { z } from 'zod'

const walletsSearchSchema = z.object({
  page: z.coerce.number().int().positive().optional().catch(1),
  limit: z.coerce.number().int().positive().optional().catch(10),
})

export const Route = createFileRoute('/_auth/wallets')({
  validateSearch: walletsSearchSchema,
  component: WalletView,
})

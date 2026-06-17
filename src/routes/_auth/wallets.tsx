import { createFileRoute } from '@tanstack/react-router'
import { WalletView } from '@/features/wallets/views/wallet.view'

export const Route = createFileRoute('/_auth/wallets')({
  component: WalletView,
})

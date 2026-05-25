import type { TelegramStatus } from '@/lib/types/database'

export function StatusBadge({ status }: { status: TelegramStatus }) {
  const className = {
    pending: 'badge badge-warning',
    sent: 'badge badge-success',
    failed: 'badge badge-error'
  }[status]

  return <span className={className}>{status}</span>
}

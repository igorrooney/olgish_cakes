import type { EventPhotoRequestRow } from '@/lib/types/database'

function escapeCsvValue(value: string): string {
  const safeValue = /^\s*[=+\-@]/.test(value) ? `'${value}` : value
  const needsQuotes = /[",\n\r]/.test(safeValue)
  const escaped = safeValue.replace(/"/g, '""')

  return needsQuotes ? `"${escaped}"` : escaped
}

export function buildKlaviyoCsv(rows: Pick<EventPhotoRequestRow, 'email' | 'full_name'>[]): string {
  const lines = [
    ['Email', 'Name'].join(','),
    ...rows.map((row) => [
      escapeCsvValue(row.email),
      escapeCsvValue(row.full_name)
    ].join(','))
  ]

  return `${lines.join('\r\n')}\r\n`
}

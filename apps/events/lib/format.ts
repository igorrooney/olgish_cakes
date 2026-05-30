export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/London'
  }).format(new Date(value))
}

export function formatBytes(bytes: number): string {
  const megabytes = bytes / 1024 / 1024
  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`
}

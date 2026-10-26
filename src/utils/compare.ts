export type Winner = 'a' | 'b' | 'tie' | null
/** Returns which side has the larger number; null when either value is unavailable. */
export function higher(a: number | null | undefined, b: number | null | undefined): Winner {
  if (a == null || b == null) return null
  return a === b ? 'tie' : a > b ? 'a' : 'b'
}
export const fmt = (n: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })
export const fmtSize = (kb: number) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`)
export function languagePercentages(l: Record<string, number>) {
  const total = Object.values(l).reduce((s, v) => s + v, 0)
  return total === 0 ? [] : Object.entries(l).map(([name, bytes]) => ({ name, pct: Math.round((bytes / total) * 1000) / 10 })).sort((x, y) => y.pct - x.pct)
}

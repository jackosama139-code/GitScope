import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { languagePercentages } from '../utils/compare'
import type { Languages } from '../types'
const COLORS = ['#4338ca', '#0e7490', '#b45309', '#be123c', '#047857', '#6d28d9', '#475569']
export function LanguageChart({ languages }: { languages: Languages }) {
  const rows = languagePercentages(languages).slice(0, 7)
  if (!rows.length) return <p className="text-sm text-slate-500">GitHub reports no language data for this repository.</p>
  return (
    <figure>
      <div aria-hidden className="h-56 w-full">
        <ResponsiveContainer><BarChart data={rows} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" unit="%" tick={{ fontSize: 12 }} /><YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
          <Bar dataKey="pct" isAnimationActive={false}>{rows.map((r, i) => <Cell key={r.name} fill={COLORS[i % COLORS.length]} />)}</Bar>
        </BarChart></ResponsiveContainer>
      </div>
      <figcaption className="mt-2 text-sm text-slate-600 dark:text-slate-400">Languages by code size: {rows.map((r) => `${r.name} ${r.pct}%`).join(', ')}.</figcaption>
    </figure>
  )
}

import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LanguageChart } from '../components/LanguageChart'
import { ErrorState, Skeleton } from '../components/States'
import { useAsync } from '../hooks/useAsync'
import { useDebounce } from '../hooks/useDebounce'
import { getLanguages, getRepo, searchRepos } from '../services/github'
import { fmt, fmtDate, fmtSize, higher, type Winner } from '../utils/compare'
import type { Repo } from '../types'

function Picker({ label, value, onPick }: { label: string; value: string; onPick: (full: string) => void }) {
  const [q, setQ] = useState('')
  const dq = useDebounce(q, 400)
  const { data, error } = useAsync((s) => (dq.trim().length > 1 ? searchRepos({ query: dq, perPage: 5 }, s) : null), [dq])
  const id = `pick-${label.replace(/\s/g, '')}`
  return (
    <div className="relative"><label htmlFor={id} className="mb-1 block text-sm font-medium">{label}{value && <span className="font-normal text-slate-500"> — {value}</span>}</label>
      <input id={id} className="input" value={q} placeholder="Search a repository…" autoComplete="off" onChange={(e) => setQ(e.target.value)} />
      {error && <p role="alert" className="mt-1 text-sm text-red-600">{error.message}</p>}
      {q && data && data.items.length > 0 && <ul aria-label={`${label} suggestions`} className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
        {data.items.map((r) => <li key={r.id}><button className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => { onPick(r.full_name); setQ('') }}>{r.full_name}</button></li>)}</ul>}
    </div>
  )
}

export default function Compare() {
  const [params, setParams] = useSearchParams()
  const a = params.get('a') ?? '', b = params.get('b') ?? ''
  const set = (k: 'a' | 'b') => (v: string) => setParams((p) => { const n = new URLSearchParams(p); n.set(k, v); return n })
  const ra = useAsync((s) => (a ? getRepo(a, s) : null), [a]), rb = useAsync((s) => (b ? getRepo(b, s) : null), [b])
  const la = useAsync((s) => (a ? getLanguages(a, s) : null), [a]), lb = useAsync((s) => (b ? getLanguages(b, s) : null), [b])
  const rows: { label: string; get: (r: Repo) => string; num?: (r: Repo) => number | null }[] = [
    { label: 'Stars', get: (r) => fmt(r.stargazers_count), num: (r) => r.stargazers_count },
    { label: 'Forks', get: (r) => fmt(r.forks_count), num: (r) => r.forks_count },
    { label: 'Open issues', get: (r) => fmt(r.open_issues_count), num: (r) => r.open_issues_count },
    { label: 'Watchers', get: (r) => fmt(r.subscribers_count ?? r.watchers_count), num: (r) => r.subscribers_count ?? r.watchers_count },
    { label: 'Size', get: (r) => fmtSize(r.size), num: (r) => r.size },
    { label: 'Primary language', get: (r) => r.language ?? 'Unavailable' },
    { label: 'License', get: (r) => r.license?.name ?? 'Unavailable' },
    { label: 'Last updated', get: (r) => fmtDate(r.updated_at), num: (r) => Date.parse(r.updated_at) },
  ]
  const cell = (w: Winner, side: 'a' | 'b', text: string) => <td className={`px-3 py-2 ${w === side ? 'font-semibold' : ''}`}>{text}{w === side && <span className="ml-2 rounded bg-indigo-100 px-1.5 text-xs text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200">Higher</span>}{w === 'tie' && <span className="ml-2 text-xs text-slate-500">Equal</span>}</td>
  const err = ra.error ?? rb.error
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Compare repositories</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">“Higher” marks the larger number only. It does not mean better code or a healthier project.</p>
      <div className="grid gap-4 sm:grid-cols-2"><Picker label="Repository A" value={a} onPick={set('a')} /><Picker label="Repository B" value={b} onPick={set('b')} /></div>
      {err && <ErrorState error={err} onRetry={() => { ra.retry(); rb.retry() }} />}
      {a && b && !err && (!ra.data || !rb.data ? <Skeleton className="h-64" /> : (
        <>
          <div className="card overflow-x-auto !p-0"><table className="w-full text-sm"><caption className="sr-only">Repository comparison</caption>
            <thead><tr className="border-b border-slate-200 text-left dark:border-slate-800"><th className="px-3 py-2">Metric</th><th className="break-all px-3 py-2">{ra.data.full_name}</th><th className="break-all px-3 py-2">{rb.data.full_name}</th></tr></thead>
            <tbody>{rows.map((row) => { const x = ra.data!, y = rb.data!; const w = row.num ? higher(row.num(x), row.num(y)) : null
              return <tr key={row.label} className="border-b border-slate-100 dark:border-slate-800"><th scope="row" className="px-3 py-2 text-left font-normal text-slate-500">{row.label}</th>{cell(w, 'a', row.get(x))}{cell(w, 'b', row.get(y))}</tr> })}</tbody></table></div>
          <div className="grid gap-4 md:grid-cols-2">{([[ra.data, la], [rb.data, lb]] as const).map(([r, l]) => <section key={r.id} className="card"><h2 className="mb-2 break-all font-semibold">{r.full_name}</h2>
            {l.data ? <LanguageChart languages={l.data} /> : <p className="text-sm text-slate-500">Language data unavailable.</p>}</section>)}</div>
        </>))}
      {(!a || !b) && <p className="card text-center text-sm text-slate-600 dark:text-slate-400">Pick two repositories above to compare them.</p>}
    </div>
  )
}

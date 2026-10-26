import { useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import { RepoCard } from '../components/RepoCard'
import { CardSkeletons, EmptyState, ErrorState } from '../components/States'
import { useApp } from '../context/AppContext'
import { useAsync } from '../hooks/useAsync'
import { useDebounce } from '../hooks/useDebounce'
import { searchRepos } from '../services/github'
import type { Sort } from '../types'

const EXAMPLES = ['react state management', 'topic:accessibility language:typescript', 'vite plugin', 'stars:>50000']
const LANGS = ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java']
export default function Home() {
  const { isFavorite, toggleFavorite, recents, addRecent, clearRecents } = useApp()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<Sort>('')
  const [language, setLanguage] = useState('')
  const [page, setPage] = useState(1)
  const dq = useDebounce(q, 500)
  const { data, error, loading, retry } = useAsync((s) => (dq.trim() ? searchRepos({ query: dq, sort, language, page }, s) : null), [dq, sort, language, page])
  const run = (v: string) => { setQ(v); setPage(1); addRecent(v) }
  const submit = (e: FormEvent) => { e.preventDefault(); run(q) }
  const pages = data ? Math.min(Math.ceil(data.total_count / 12), 80) : 0 // GitHub exposes only the first 1000 results
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore the open-source universe.</h1>
        <p className="max-w-xl text-slate-600 dark:text-slate-400">Search public GitHub repositories, inspect their health, and compare them side by side.</p>
        <form onSubmit={submit} role="search" className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 text-slate-400" size={18} aria-hidden />
            <label htmlFor="q" className="sr-only">Search repositories</label>
            <input id="q" className="input !py-2.5 pl-10" placeholder="Name, topic, description or qualifier…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} /></div>
          <label className="sr-only" htmlFor="lang">Language</label>
          <select id="lang" className="input sm:w-40" value={language} onChange={(e) => { setLanguage(e.target.value); setPage(1) }}><option value="">All languages</option>{LANGS.map((l) => <option key={l}>{l}</option>)}</select>
          <label className="sr-only" htmlFor="sort">Sort by</label>
          <select id="sort" className="input sm:w-40" value={sort} onChange={(e) => { setSort(e.target.value as Sort); setPage(1) }}>
            <option value="">Best match</option><option value="stars">Most stars</option><option value="forks">Most forks</option><option value="updated">Recently updated</option></select>
          <button className="btn btn-primary" type="submit">Search</button>
        </form>
        <div className="flex flex-wrap items-center gap-2 text-sm"><span className="text-slate-500">Try an example search:</span>
          {EXAMPLES.map((e) => <button key={e} className="chip hover:underline" onClick={() => run(e)}>{e}</button>)}</div>
        {recents.length > 0 && <div className="flex flex-wrap items-center gap-2 text-sm"><span className="text-slate-500">Recent searches:</span>
          {recents.map((r) => <button key={r} className="btn !px-2 !py-0.5 text-xs" onClick={() => run(r)}>{r}</button>)}
          <button className="text-xs text-slate-500 underline" onClick={clearRecents}>Clear history</button></div>}
      </section>
      <section aria-live="polite" aria-busy={loading}>
        {error && <ErrorState error={error} onRetry={error.retryable ? retry : undefined} />}
        {loading && !data && <CardSkeletons />}
        {!dq.trim() && !error && <EmptyState title="Search to get started" hint="Use the box above or click an example search." />}
        {data && dq.trim() && !error && (data.items.length === 0 ? <EmptyState title={`No repositories match “${dq}”`} hint="Try fewer words or remove the language filter." /> : (
          <div className={loading ? 'opacity-60' : ''}>
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">{data.total_count.toLocaleString()} repositories found</p>
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{data.items.map((r) => <li key={r.id} className="min-w-0"><RepoCard repo={r} favorite={isFavorite(r.full_name)} onToggleFavorite={toggleFavorite} /></li>)}</ul>
            <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-3">
              <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span className="text-sm" aria-current="page">Page {page} of {pages}</span>
              <button className="btn" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></nav>
          </div>))}
      </section>
    </div>
  )
}

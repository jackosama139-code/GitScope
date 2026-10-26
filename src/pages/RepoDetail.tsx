import { useParams } from 'react-router-dom'
import { ExternalLink, Heart } from 'lucide-react'
import { LanguageChart } from '../components/LanguageChart'
import { EmptyState, ErrorState, Skeleton } from '../components/States'
import { useApp } from '../context/AppContext'
import { useAsync } from '../hooks/useAsync'
import { getCommits, getContributors, getLanguages, getRepo } from '../services/github'
import { fmt, fmtDate, fmtSize } from '../utils/compare'

export default function RepoDetail() {
  const { owner = '', name = '' } = useParams()
  const full = `${owner}/${name}`
  const { isFavorite, toggleFavorite } = useApp()
  const repo = useAsync((s) => getRepo(full, s), [full])
  const langs = useAsync((s) => getLanguages(full, s), [full])
  const contribs = useAsync((s) => getContributors(full, s), [full])
  const commits = useAsync((s) => getCommits(full, s), [full])
  if (repo.error) return <ErrorState error={repo.error} onRetry={repo.retry} />
  if (!repo.data) return <div role="status" aria-label="Loading repository" className="space-y-4"><Skeleton className="h-8 w-1/2" /><Skeleton /><Skeleton className="h-40" /></div>
  const r = repo.data
  const stats: [string, string][] = [['Stars', fmt(r.stargazers_count)], ['Forks', fmt(r.forks_count)], ['Watchers', fmt(r.subscribers_count ?? r.watchers_count)], ['Open issues', fmt(r.open_issues_count)], ['Size', fmtSize(r.size)]]
  const fav = isFavorite(r.full_name)
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><h1 className="break-words text-2xl font-bold">{r.full_name}</h1>
          <p className="mt-1 break-words text-slate-600 dark:text-slate-400">{r.description ?? 'No description provided.'}</p></div>
        <div className="flex gap-2">
          <button className="btn" aria-pressed={fav} onClick={() => toggleFavorite(r)}><Heart size={16} className={fav ? 'fill-rose-600 text-rose-600' : ''} aria-hidden />{fav ? 'Remove favorite' : 'Add favorite'}</button>
          <a className="btn" href={r.html_url} target="_blank" rel="noreferrer">GitHub <ExternalLink size={14} aria-hidden /><span className="sr-only">(opens in new tab)</span></a></div>
      </header>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">{stats.map(([k, v]) => <div key={k} className="card !p-4"><dt className="text-xs text-slate-500">{k}</dt><dd className="text-xl font-semibold">{v}</dd></div>)}</dl>
      <dl className="card grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {[['Primary language', r.language ?? 'Not detected'], ['License', r.license?.name ?? 'No license detected'], ['Default branch', r.default_branch], ['Created', fmtDate(r.created_at)], ['Last updated', fmtDate(r.updated_at)], ['Last push', fmtDate(r.pushed_at)]].map(([k, v]) => <div key={k}><dt className="text-slate-500">{k}</dt><dd className="break-words font-medium">{v}</dd></div>)}
      </dl>
      {!!r.topics?.length && <ul className="flex flex-wrap gap-1.5" aria-label="Topics">{r.topics.map((t) => <li key={t} className="chip">{t}</li>)}</ul>}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card" aria-labelledby="lh"><h2 id="lh" className="mb-3 font-semibold">Languages</h2>
          {langs.error ? <ErrorState error={langs.error} onRetry={langs.retry} /> : langs.data ? <LanguageChart languages={langs.data} /> : <Skeleton className="h-40" />}</section>
        <section className="card" aria-labelledby="ch"><h2 id="ch" className="mb-3 font-semibold">Top contributors</h2>
          {contribs.error ? <ErrorState error={contribs.error} onRetry={contribs.retry} /> : !contribs.data ? <Skeleton className="h-40" /> : contribs.data.length === 0 ? <p className="text-sm text-slate-500">No contributor data available.</p> :
            <ul className="space-y-2">{contribs.data.map((c) => <li key={c.id} className="flex items-center gap-3">
              <img src={`${c.avatar_url}${c.avatar_url.includes('?') ? '&' : '?'}s=64`} width={32} height={32} loading="lazy" decoding="async" alt="" className="rounded-full" />
              <a className="min-w-0 flex-1 truncate hover:underline" href={c.html_url} target="_blank" rel="noreferrer">{c.login}</a><span className="text-sm text-slate-500">{c.contributions.toLocaleString()} commits</span></li>)}</ul>}</section>
      </div>
      <section className="card" aria-labelledby="mh"><h2 id="mh" className="mb-3 font-semibold">Recent commits</h2>
        {commits.error ? <ErrorState error={commits.error} onRetry={commits.retry} /> : !commits.data ? <Skeleton className="h-32" /> : commits.data.length === 0 ? <EmptyState title="No commits found" /> :
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">{commits.data.map((c) => <li key={c.sha} className="py-2">
            <a className="line-clamp-1 break-words font-medium hover:underline" href={c.html_url} target="_blank" rel="noreferrer">{c.commit.message.split('\n')[0]}</a>
            <p className="text-xs text-slate-500">{c.author?.login ?? c.commit.author?.name ?? 'Unknown author'} · {c.commit.author ? fmtDate(c.commit.author.date) : 'date unavailable'}</p></li>)}</ul>}</section>
    </div>
  )
}

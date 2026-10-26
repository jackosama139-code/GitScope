import { memo } from 'react'
import { Link } from 'react-router-dom'
import { CircleDot, ExternalLink, GitFork, Heart, Star } from 'lucide-react'
import type { Repo } from '../types'
import { fmt, fmtDate } from '../utils/compare'

interface Props { repo: Repo; favorite: boolean; onToggleFavorite: (r: Repo) => void }
function RepoCardBase({ repo, favorite, onToggleFavorite }: Props) {
  return (
    <article className="card flex h-full min-w-0 flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 break-words font-semibold"><Link className="hover:underline" to={`/repo/${repo.full_name}`}><span className="font-normal text-slate-500">{repo.owner.login}/</span>{repo.name}</Link></h3>
        <button className="btn !p-1.5" aria-pressed={favorite} aria-label={`${favorite ? 'Remove' : 'Save'} ${repo.full_name} ${favorite ? 'from' : 'to'} favorites`} onClick={() => onToggleFavorite(repo)}>
          <Heart size={16} className={favorite ? 'fill-rose-600 text-rose-600' : ''} aria-hidden />
        </button>
      </div>
      <p className="line-clamp-2 break-words text-sm text-slate-600 dark:text-slate-400">{repo.description ?? 'No description provided.'}</p>
      {!!repo.topics?.length && <ul className="flex flex-wrap gap-1.5" aria-label="Topics">{repo.topics.slice(0, 5).map((t) => <li key={t} className="chip">{t}</li>)}</ul>}
      <dl className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1"><dt className="sr-only">Language</dt><dd>{repo.language ?? 'Unknown language'}</dd></div>
        <div className="flex items-center gap-1"><Star size={14} aria-hidden /><dt className="sr-only">Stars</dt><dd>{fmt(repo.stargazers_count)}</dd></div>
        <div className="flex items-center gap-1"><GitFork size={14} aria-hidden /><dt className="sr-only">Forks</dt><dd>{fmt(repo.forks_count)}</dd></div>
        <div className="flex items-center gap-1"><CircleDot size={14} aria-hidden /><dt className="sr-only">Open issues</dt><dd>{fmt(repo.open_issues_count)}</dd></div>
      </dl>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Updated {fmtDate(repo.updated_at)}</span>
        <a className="inline-flex items-center gap-1 hover:underline" href={repo.html_url} target="_blank" rel="noreferrer">GitHub <ExternalLink size={12} aria-hidden /><span className="sr-only">(opens in new tab)</span></a>
      </div>
    </article>
  )
}
export const RepoCard = memo(RepoCardBase)

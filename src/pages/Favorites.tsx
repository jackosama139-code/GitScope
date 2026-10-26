import { Link } from 'react-router-dom'
import { EmptyState } from '../components/States'
import { useApp } from '../context/AppContext'
import { useAsync } from '../hooks/useAsync'
import { getRepo } from '../services/github'
import type { FavoriteRepo } from '../types'

function Item({ fav }: { fav: FavoriteRepo }) {
  const { removeFavorite } = useApp()
  const live = useAsync((s) => getRepo(fav.full_name, s), [fav.full_name])
  const stale = live.error?.status === 404
  const r = live.data
  return (
    <li className="card flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0"><Link className="break-all font-semibold hover:underline" to={`/repo/${fav.full_name}`}>{fav.full_name}</Link>
        <p className="break-words text-sm text-slate-600 dark:text-slate-400">{r?.description ?? fav.description ?? 'No description provided.'}</p>
        <p className="text-xs text-slate-500">{r?.language ?? fav.language ?? 'Unknown language'} · Saved {new Date(fav.savedAt).toLocaleDateString()}
          {stale && <span role="alert" className="ml-2 font-medium text-red-700 dark:text-red-400">No longer accessible: renamed, deleted or private. Showing saved details.</span>}
          {live.error && !stale && <span className="ml-2">Could not refresh: {live.error.message}</span>}</p></div>
      <button className="btn" onClick={() => removeFavorite(fav.full_name)} aria-label={`Remove ${fav.full_name} from favorites`}>Remove</button>
    </li>
  )
}
export default function Favorites() {
  const { favorites } = useApp()
  return (<div className="space-y-4"><h1 className="text-2xl font-bold">Favorites</h1>
    {favorites.length === 0 ? <EmptyState title="No favorites yet" hint="Use the heart on any repository to save it here." /> : <ul className="space-y-3">{favorites.map((f) => <Item key={f.full_name} fav={f} />)}</ul>}</div>)
}

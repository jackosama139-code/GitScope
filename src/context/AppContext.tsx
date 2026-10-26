import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { FavoriteRepo, Repo } from '../types'

type Theme = 'light' | 'dark'
interface Ctx {
  favorites: FavoriteRepo[]; isFavorite: (n: string) => boolean; toggleFavorite: (r: Repo) => void; removeFavorite: (n: string) => void
  recents: string[]; addRecent: (q: string) => void; clearRecents: () => void
  theme: Theme; setTheme: (t: Theme) => void; clearAll: () => void; notify: (m: string) => void
}
const AppCtx = createContext<Ctx | null>(null)
export const useApp = () => { const c = useContext(AppCtx); if (!c) throw new Error('useApp outside AppProvider'); return c }

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useLocalStorage<FavoriteRepo[]>('gitscope:favorites', [])
  const [recents, setRecents] = useLocalStorage<string[]>('gitscope:recents', [])
  const [theme, setTheme] = useLocalStorage<Theme>('gitscope:theme', 'light')
  const [toast, setToast] = useState('')
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark') }, [theme])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2500); return () => clearTimeout(t) }, [toast])
  const notify = useCallback((m: string) => setToast(m), [])
  const removeFavorite = useCallback((n: string) => { setFavorites((f) => f.filter((x) => x.full_name !== n)); notify('Removed from favorites') }, [setFavorites, notify])
  const toggleFavorite = useCallback((r: Repo) => {
    if (favorites.some((f) => f.full_name === r.full_name)) return removeFavorite(r.full_name)
    setFavorites((f) => [{ full_name: r.full_name, description: r.description, language: r.language, html_url: r.html_url, savedAt: new Date().toISOString() }, ...f])
    notify('Saved to favorites')
  }, [favorites, setFavorites, removeFavorite, notify])
  const addRecent = useCallback((q: string) => {
    const t = q.trim(); if (!t) return
    setRecents((r) => (r[0] === t ? r : [t, ...r.filter((x) => x !== t)].slice(0, 10)))
  }, [setRecents])
  const value = useMemo<Ctx>(() => ({
    favorites, isFavorite: (n) => favorites.some((f) => f.full_name === n), toggleFavorite, removeFavorite,
    recents, addRecent, clearRecents: () => setRecents([]), theme, setTheme, notify,
    clearAll: () => { setFavorites([]); setRecents([]); setTheme('light'); notify('Local data cleared') },
  }), [favorites, recents, theme, toggleFavorite, removeFavorite, addRecent, setFavorites, setRecents, setTheme, notify])
  return <AppCtx.Provider value={value}>{children}<div role="status" aria-live="polite" className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2">{toast && <p className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">{toast}</p>}</div></AppCtx.Provider>
}

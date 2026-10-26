import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { rateLimit } from '../services/github'

const links = [['/', 'Explore'], ['/compare', 'Compare'], ['/favorites', 'Favorites'], ['/settings', 'Settings']] as const
export function Layout() {
  const { theme, setTheme } = useApp()
  const [, force] = useState(0)
  useEffect(() => { const h = () => force((n) => n + 1); window.addEventListener('gitscope:rate', h); return () => window.removeEventListener('gitscope:rate', h) }, [])
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-2">Skip to content</a>
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 font-bold">
            <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden><rect width="32" height="32" rx="8" fill="#4f46e5" /><circle cx="16" cy="16" r="6" fill="none" stroke="#fff" strokeWidth="3" /></svg>GitScope
          </NavLink>
          <nav aria-label="Main" className="flex flex-1 flex-wrap gap-1">
            {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `rounded-md px-3 py-1.5 text-sm ${isActive ? 'bg-indigo-50 font-medium text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{label}</NavLink>)}
          </nav>
          <button className="btn !p-2" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8"><Outlet /></main>
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500 dark:border-slate-800">
        Data from the GitHub REST API (unauthenticated). {rateLimit.remaining !== null ? `API requests left this hour: ${rateLimit.remaining}/${rateLimit.limit}.` : 'Rate limit appears after the first request.'}
      </footer>
    </div>
  )
}

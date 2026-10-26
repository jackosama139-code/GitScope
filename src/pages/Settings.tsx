import { useState } from 'react'
import { useApp } from '../context/AppContext'
export default function Settings() {
  const { theme, setTheme, clearAll } = useApp()
  const [confirm, setConfirm] = useState(false)
  return (
    <div className="max-w-2xl space-y-6"><h1 className="text-2xl font-bold">Settings</h1>
      <section className="card"><h2 className="mb-2 font-semibold">Theme</h2>
        <label className="mr-4"><input type="radio" name="t" checked={theme === 'light'} onChange={() => setTheme('light')} /> Light</label>
        <label><input type="radio" name="t" checked={theme === 'dark'} onChange={() => setTheme('dark')} /> Dark</label></section>
      <section className="card"><h2 className="mb-2 font-semibold">Local data</h2>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">Favorites, recent searches and theme are stored only in this browser. Nothing is sent to a server.</p>
        {confirm ? <div role="alertdialog" aria-label="Confirm clearing data" className="flex items-center gap-2"><span className="text-sm">Delete all saved data?</span>
          <button className="btn btn-primary" onClick={() => { clearAll(); setConfirm(false) }}>Yes, clear</button><button className="btn" onClick={() => setConfirm(false)}>Cancel</button></div>
          : <button className="btn" onClick={() => setConfirm(true)}>Clear local data</button>}</section>
      <section className="card"><h2 className="mb-2 font-semibold">GitHub API rate limits</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">GitScope calls GitHub without a token. Unauthenticated requests are limited per IP address (about 60 per hour for most endpoints, with a lower per-minute limit for search). When the limit is hit you will see a message; wait for the reset time and retry. Responses are cached for 5 minutes to reduce usage.</p></section>
    </div>)
}

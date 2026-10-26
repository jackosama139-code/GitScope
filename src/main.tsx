import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { Layout } from './components/Layout'
import { Skeleton } from './components/States'
import Home from './pages/Home'
import Favorites from './pages/Favorites'
import Settings from './pages/Settings'
import './index.css'
const RepoDetail = lazy(() => import('./pages/RepoDetail'))
const Compare = lazy(() => import('./pages/Compare'))
createRoot(document.getElementById('root')!).render(
  <StrictMode><AppProvider><BrowserRouter>
    <Suspense fallback={<div role="status" className="p-8"><Skeleton className="h-8 w-1/3" /></div>}>
      <Routes><Route element={<Layout />}>
        <Route index element={<Home />} /><Route path="repo/:owner/:name" element={<RepoDetail />} />
        <Route path="compare" element={<Compare />} /><Route path="favorites" element={<Favorites />} /><Route path="settings" element={<Settings />} />
        <Route path="*" element={<p className="py-12 text-center">Page not found.</p>} /></Route></Routes>
    </Suspense></BrowserRouter></AppProvider></StrictMode>)

import { AlertTriangle } from 'lucide-react'
import type { ApiError } from '../services/github'
export const Skeleton = ({ className = 'h-4 w-full' }: { className?: string }) => <div aria-hidden className={`animate-pulse rounded bg-slate-200 dark:bg-slate-800 ${className}`} />
export const CardSkeletons = ({ n = 6 }: { n?: number }) => (
  <div role="status" aria-label="Loading repositories" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: n }, (_, i) => <div key={i} className="card space-y-3"><Skeleton className="h-5 w-2/3" /><Skeleton /><Skeleton className="w-4/5" /><Skeleton className="h-4 w-1/2" /></div>)}
  </div>
)
export const ErrorState = ({ error, onRetry }: { error: ApiError | Error; onRetry?: () => void }) => (
  <div role="alert" className="card flex items-start gap-3 border-red-300 dark:border-red-900">
    <AlertTriangle className="mt-0.5 shrink-0 text-red-600" size={20} aria-hidden />
    <div><p className="font-medium">Something went wrong</p><p className="text-sm text-slate-600 dark:text-slate-400">{error.message}</p>
      {onRetry && <button className="btn mt-3" onClick={onRetry}>Retry</button>}</div>
  </div>
)
export const EmptyState = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="card py-12 text-center"><p className="font-medium">{title}</p>{hint && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{hint}</p>}</div>
)

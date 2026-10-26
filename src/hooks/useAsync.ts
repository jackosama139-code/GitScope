import { useEffect, useState } from 'react'
import { ApiError } from '../services/github'
interface State<T> { data?: T; error?: ApiError; loading: boolean }
/** Runs `fn` when deps change (or retry is called); aborts the in-flight request on change/unmount. Return null to skip. */
export function useAsync<T>(fn: (s: AbortSignal) => Promise<T> | null, deps: unknown[]) {
  const [state, setState] = useState<State<T>>({ loading: false })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const ctrl = new AbortController()
    const p = fn(ctrl.signal)
    if (!p) { setState({ loading: false }); return }
    setState((s) => ({ data: s.data, loading: true }))
    p.then((data) => setState({ data, loading: false }))
      .catch((e: unknown) => { if (!ctrl.signal.aborted) setState({ loading: false, error: e instanceof ApiError ? e : new ApiError(0, 'Unexpected error.', true) }) })
    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])
  return { ...state, retry: () => setTick((t) => t + 1) }
}

import type { Commit, Contributor, Languages, Repo, SearchResult, Sort } from '../types'

const BASE = 'https://api.github.com'
const TTL_MS = 5 * 60 * 1000 // cached GET responses expire after 5 minutes

export class ApiError extends Error {
  constructor(public status: number, message: string, public retryable = false) { super(message) }
}
export const rateLimit: { remaining: number | null; limit: number | null; reset: number | null } = { remaining: null, limit: null, reset: null }
const cache = new Map<string, { at: number; value: unknown }>()
export const clearCache = () => cache.clear()

function messageFor(status: number, rateLimited: boolean): string {
  if (status === 404) return 'Repository not found. It may be private, renamed or deleted.'
  if (status === 422) return 'GitHub could not parse that search. Remove special characters or qualifiers and try again.'
  if (status === 429 || (status === 403 && rateLimited)) return 'GitHub API rate limit reached. Wait until the limit resets, then retry.'
  if (status === 403) return 'GitHub refused this request (403).'
  return `GitHub returned an error (${status}).`
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const hit = cache.get(path)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as T
  let res: Response
  try {
    res = await fetch(BASE + path, { signal, headers: { Accept: 'application/vnd.github+json' } })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new ApiError(0, 'Network error. Check your connection and retry.', true)
  }
  const remaining = res.headers.get('x-ratelimit-remaining')
  if (remaining !== null) {
    rateLimit.remaining = Number(remaining)
    rateLimit.limit = Number(res.headers.get('x-ratelimit-limit'))
    rateLimit.reset = Number(res.headers.get('x-ratelimit-reset'))
    window.dispatchEvent(new Event('gitscope:rate'))
  }
  if (!res.ok) throw new ApiError(res.status, messageFor(res.status, remaining === '0'), res.status >= 500 || res.status === 403 || res.status === 429)
  const value = (res.status === 204 ? [] : await res.json()) as T // 204: empty repo has no contributors
  cache.set(path, { at: Date.now(), value })
  return value
}

export interface SearchParams { query: string; sort?: Sort; language?: string; page?: number; perPage?: number }
export const searchRepos = (p: SearchParams, signal?: AbortSignal) => {
  const q = [p.query.trim(), p.language ? `language:${p.language}` : ''].filter(Boolean).join(' ')
  const qs = new URLSearchParams({ q, per_page: String(p.perPage ?? 12), page: String(p.page ?? 1) })
  if (p.sort) { qs.set('sort', p.sort); qs.set('order', 'desc') }
  return request<SearchResult>(`/search/repositories?${qs}`, signal)
}
export const getRepo = (fullName: string, s?: AbortSignal) => request<Repo>(`/repos/${fullName}`, s)
export const getLanguages = (fullName: string, s?: AbortSignal) => request<Languages>(`/repos/${fullName}/languages`, s)
export const getContributors = (fullName: string, s?: AbortSignal) => request<Contributor[]>(`/repos/${fullName}/contributors?per_page=10`, s)
export const getCommits = (fullName: string, s?: AbortSignal) => request<Commit[]>(`/repos/${fullName}/commits?per_page=8`, s)

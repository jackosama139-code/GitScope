export interface Repo {
  id: number; name: string; full_name: string; html_url: string; description: string | null
  owner: { login: string; avatar_url: string }; language: string | null
  stargazers_count: number; forks_count: number; open_issues_count: number; watchers_count: number
  subscribers_count?: number; size: number; license: { name: string } | null; topics?: string[]
  created_at: string; updated_at: string; pushed_at: string; default_branch: string
}
export interface SearchResult { total_count: number; incomplete_results: boolean; items: Repo[] }
export type Languages = Record<string, number>
export interface Contributor { id: number; login: string; avatar_url: string; html_url: string; contributions: number }
export interface Commit { sha: string; html_url: string; commit: { message: string; author: { name: string; date: string } | null }; author: { login: string } | null }
export interface FavoriteRepo { full_name: string; description: string | null; language: string | null; html_url: string; savedAt: string }
export type Sort = '' | 'stars' | 'forks' | 'updated'

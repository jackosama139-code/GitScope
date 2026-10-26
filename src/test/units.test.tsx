import { act, renderHook, render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { RepoCard } from '../components/RepoCard'
import { ErrorState, EmptyState } from '../components/States'
import { useDebounce } from '../hooks/useDebounce'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ApiError } from '../services/github'
import { higher, languagePercentages } from '../utils/compare'
import type { Repo } from '../types'

const repo = { id: 1, name: 'react', full_name: 'facebook/react', html_url: 'https://github.com/facebook/react', description: null, owner: { login: 'facebook', avatar_url: '' }, language: 'JavaScript', stargazers_count: 12000, forks_count: 5, open_issues_count: 7, watchers_count: 1, size: 1, license: null, topics: ['ui'], created_at: '2013-05-24T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', pushed_at: '2024-01-01T00:00:00Z', default_branch: 'main' } as Repo
describe('compare utils', () => {
  it('picks the higher value and handles missing data', () => { expect(higher(2, 1)).toBe('a'); expect(higher(1, 2)).toBe('b'); expect(higher(1, 1)).toBe('tie'); expect(higher(null, 1)).toBeNull() })
  it('computes language percentages', () => expect(languagePercentages({ A: 75, B: 25 })).toEqual([{ name: 'A', pct: 75 }, { name: 'B', pct: 25 }]))
})
describe('useLocalStorage', () => {
  it('persists and reloads values', () => {
    const { result, unmount } = renderHook(() => useLocalStorage<string[]>('k', []))
    act(() => result.current[1](['x'])); unmount()
    expect(renderHook(() => useLocalStorage<string[]>('k', [])).result.current[0]).toEqual(['x'])
  })
  it('falls back when stored JSON is corrupt', () => { localStorage.setItem('bad', '{'); expect(renderHook(() => useLocalStorage('bad', 5)).result.current[0]).toBe(5) })
})
describe('useDebounce', () => {
  it('delays updates', () => {
    vi.useFakeTimers(); const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), { initialProps: { v: 'a' } })
    rerender({ v: 'b' }); expect(result.current).toBe('a'); act(() => { vi.advanceTimersByTime(300) }); expect(result.current).toBe('b'); vi.useRealTimers()
  })
})
describe('components', () => {
  it('renders a repo card with fallback description and toggles favorite', () => {
    const toggle = vi.fn(); render(<MemoryRouter><RepoCard repo={repo} favorite={false} onToggleFavorite={toggle} /></MemoryRouter>)
    expect(screen.getByText('No description provided.')).toBeInTheDocument(); expect(screen.getByText('12K')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /save facebook\/react/i })); expect(toggle).toHaveBeenCalledWith(repo)
  })
  it('shows error with retry and empty state', () => {
    const retry = vi.fn(); render(<><ErrorState error={new ApiError(429, 'Rate limited', true)} onRetry={retry} /><EmptyState title="Nothing here" /></>)
    fireEvent.click(screen.getByRole('button', { name: 'Retry' })); expect(retry).toHaveBeenCalled(); expect(screen.getByRole('alert')).toHaveTextContent('Rate limited'); expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })
})

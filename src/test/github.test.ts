import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, clearCache, getRepo, searchRepos } from '../services/github'
const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 })
beforeEach(() => { clearCache(); vi.restoreAllMocks() })
describe('github service', () => {
  it('builds the search URL with language, sort and page', async () => {
    const f = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok({ total_count: 0, items: [] }))
    await searchRepos({ query: 'react', language: 'TypeScript', sort: 'stars', page: 2 })
    const url = decodeURIComponent(String(f.mock.calls[0][0]).replace(/\+/g, ' '))
    expect(url).toContain('q=react language:TypeScript'); expect(url).toContain('sort=stars'); expect(url).toContain('page=2')
  })
  it('caches identical requests', async () => {
    const f = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => ok({ full_name: 'a/b' }))
    await getRepo('a/b'); await getRepo('a/b'); expect(f).toHaveBeenCalledTimes(1)
  })
  it.each([[404, /not found/i], [422, /parse/i], [429, /rate limit/i]])('maps HTTP %i to a readable error', async (status, msg) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status }))
    await expect(getRepo('a/b')).rejects.toMatchObject({ status, message: expect.stringMatching(msg) })
  })
  it('treats 403 with no remaining quota as rate limited', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 403, headers: { 'x-ratelimit-remaining': '0' } }))
    await expect(getRepo('a/b')).rejects.toThrow(/rate limit/i)
  })
  it('reports network failures as retryable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('fail'))
    const e = (await getRepo('a/b').catch((x) => x)) as ApiError
    expect(e).toBeInstanceOf(ApiError); expect(e.retryable).toBe(true)
  })
})

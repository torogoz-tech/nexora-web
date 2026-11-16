import { afterEach, describe, expect, it, vi } from 'vitest'
import { prepareProjectInput } from '../src/utils/prepareProjectInput'
import { createProject } from '../src/services/createProject'
import { sessionStore } from '../src/app/sessionStore'

describe('project creation', () => {
  afterEach(() => {
    sessionStore.current = null
    vi.unstubAllGlobals()
  })
  it('normalizes the name and omits an empty optional description', () => {
    expect(prepareProjectInput('  Nexora  ', '  ')).toEqual({
      name: 'Nexora',
      description: null,
    })
  })
  it('uses the API byte limits for international names', () => {
    expect(() => prepareProjectInput('é'.repeat(81), '')).toThrow()
    expect(() => prepareProjectInput('Valid', 'é'.repeat(2001))).toThrow()
    expect(() => prepareProjectInput(' ', '')).toThrow()
  })
  it('posts the form with the caller idempotency key and returns the created project', async () => {
    sessionStore.current = null
    const project = {
      id: 'prj-test',
      name: 'Nexora',
      description: null,
      archived: false,
      revision: 1,
    }
    const request = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(project), { status: 201 }))
    vi.stubGlobal('fetch', request)
    expect(
      await createProject(
        { name: 'Nexora', description: null },
        'stable-request',
        new AbortController().signal,
      ),
    ).toEqual(project)
    const [path, options] = request.mock.calls[0]!
    expect(path).toBe('/api/v1/projects')
    expect(options.method).toBe('POST')
    expect(new Headers(options.headers).get('Idempotency-Key')).toBe(
      'stable-request',
    )
    expect(JSON.parse(options.body)).toEqual({
      name: 'Nexora',
      description: null,
    })
  })
  it('explains a duplicate project without leaking backend details', async () => {
    sessionStore.current = null
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 409 })),
    )
    await expect(
      createProject(
        { name: 'Nexora', description: null },
        'stable-request',
        new AbortController().signal,
      ),
    ).rejects.toThrow('Ya existe')
  })
})

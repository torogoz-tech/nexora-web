import { describe, expect, it } from 'vitest'
import { parseIssuedSession } from '../src/utils/parseIssuedSession'
import { getReturnPath } from '../src/utils/getReturnPath'

describe('authentication boundaries', () => {
  it('accepts a valid API session and calculates its expiration', () => {
    expect(
      parseIssuedSession(
        {
          access_token: 'session-test',
          token_type: 'Bearer',
          expires_in: 60,
          actor_id: 'actor-test',
        },
        1000,
      ),
    ).toEqual({
      accessToken: 'session-test',
      actorId: 'actor-test',
      expiresAt: 61000,
    })
  })
  it.each([
    null,
    {},
    { access_token: 'x', token_type: 'Bearer', expires_in: -1, actor_id: 'a' },
    { access_token: 'x', token_type: 'Basic', expires_in: 60, actor_id: 'a' },
  ])('rejects malformed session responses', (value) => {
    expect(() => parseIssuedSession(value)).toThrow()
  })
  it('preserves the requested internal destination', () => {
    expect(getReturnPath('/tasks/board')).toBe('/tasks/board')
    expect(getReturnPath('/boards/wfl_test?after=t1')).toBe(
      '/boards/wfl_test?after=t1',
    )
    expect(getReturnPath('/tasks?type=bug')).toBe('/tasks?type=bug')
  })
  it.each([
    '//outside.example/path',
    'https://outside.example',
    '/login',
    '/api/v1/projects',
    '/unknown',
  ])('rejects unsafe or invalid return destinations', (value) => {
    expect(getReturnPath(value)).toBe('/profile')
  })
})

it('moves legacy organization destinations into settings without losing query filters', () => {
  expect(getReturnPath('/organization/projects?search=ticket')).toBe(
    '/settings/projects?search=ticket',
  )
  expect(getReturnPath('/organization')).toBe('/settings/members')
  expect(getReturnPath('/organization/members')).toBe('/settings/members')
  expect(getReturnPath('/organization/repositories')).toBe('/code')
  expect(getReturnPath('/settings/members')).toBe('/settings/members')
})

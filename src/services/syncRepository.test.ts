import { beforeEach, describe, expect, it, vi } from 'vitest'
import { syncRepository } from './syncRepository'
import { readApiJson } from './readApiJson'
import { integrationRequest } from './integrationRequest'
vi.mock('./readApiJson', () => ({ readApiJson: vi.fn() }))
vi.mock('./integrationRequest', () => ({ integrationRequest: vi.fn() }))
const repository = { id: 'repo', project_id: 'project', source_kind: 'git', provider: 'github', host: 'github.com', requested_full_name: 'team/repo', remote_full_name: 'team/repo', authorization_status: 'authorized', archived: false, revision: 7, latest_source_commit: null }
beforeEach(() => vi.resetAllMocks())
describe('manual repository synchronization', () => {
  it('reads the current revision and enqueues a durable sync without claiming completion', async () => {
    vi.mocked(readApiJson).mockResolvedValue(repository)
    vi.mocked(integrationRequest).mockResolvedValue({ id: 'job-1', state: 'queued' })
    const signal = new AbortController().signal
    expect(await syncRepository('project', 'repo', signal, 'request-1')).toEqual({ id: 'job-1', state: 'queued', project: 'project' })
    expect(integrationRequest).toHaveBeenCalledWith('/api/v1/projects/project/repositories/repo/sync', 'POST', { expected_revision: 7 }, 'request-1', signal)
  })
  it.each([{ archived: true }, { authorization_status: 'awaiting_authorization' }, { source_kind: 'local_snapshot' }])('does not enqueue unavailable sources: %j', async patch => {
    vi.mocked(readApiJson).mockResolvedValue({ ...repository, ...patch })
    await expect(syncRepository('project', 'repo', new AbortController().signal, 'request-1')).rejects.toThrow()
    expect(integrationRequest).not.toHaveBeenCalled()
  })
})

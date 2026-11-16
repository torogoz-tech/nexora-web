// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import TaskTypeForm from '../components/TaskTypeForm'
import { writeTaskTypeSettings } from '../services/writeTaskTypeSettings'
vi.mock('../services/writeTaskTypeSettings', () => ({ writeTaskTypeSettings: vi.fn().mockResolvedValue({}) }))
afterEach(() => { cleanup(); vi.clearAllMocks() })
it('allows editing the purpose of an existing type and sends it with its revision', async () => {
  render(<TaskTypeForm type={{ code: 'bug', name: 'Error', purpose: 'general', revision: 3, archived: false, description: null, color: null }} onSaved={() => {}} />)
  const purpose = screen.getByRole('combobox', { name: 'Propósito' })
  expect((purpose as HTMLSelectElement).disabled).toBe(false)
  fireEvent.change(purpose, { target: { value: 'implementation' } })
  fireEvent.change(screen.getByText('Motivo del cambio').querySelector('textarea')!, { target: { value: 'Clasificar como implementación' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar tipo de tarea' }))
  await waitFor(() => expect(writeTaskTypeSettings).toHaveBeenCalledWith('/api/v1/task-types/bug/change', 'POST', expect.objectContaining({ purpose: 'implementation', expected_revision: 3 }), expect.any(String), expect.any(AbortSignal)))
})

// @vitest-environment jsdom
import { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WorkflowGuardEditor from '../components/WorkflowGuardEditor'
import type { WorkflowGuard } from '../types/WorkflowGuard'
beforeEach(() => {
  HTMLElement.prototype.hidePopover = vi.fn()
})
afterEach(cleanup)
function EditableGuards() {
  const [guards, setGuards] = useState<WorkflowGuard[]>([])
  return <WorkflowGuardEditor guards={guards} onChange={setGuards} disabled={false} taskOnly />
}
describe('condition list editor', () => {
  it('adds a condition with plus and removes it without displaying a checkbox catalog', () => {
    render(<EditableGuards />)
    expect(screen.queryByRole('checkbox')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Agregar condición' }))
    expect(screen.getByRole('button', { name: 'Quitar condición' })).toBeTruthy()
    fireEvent.click(screen.getByRole('combobox', { name: 'Tipo de condición' }))
    expect(screen.queryByRole('option', { hidden: true, name: 'Persona asignada' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Quitar condición' }))
    expect(screen.getByText('Sin condiciones adicionales.')).toBeTruthy()
  })
  it('requires a valid unique field before adding and supports editing it', () => {
    render(<EditableGuards />)
    fireEvent.click(screen.getByRole('combobox', { name: 'Tipo de condición' }))
    fireEvent.click(screen.getByRole('option', { hidden: true, name: 'Campo obligatorio' }))
    expect((screen.getByRole('button', { name: 'Agregar condición' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByRole('textbox', { name: 'Nuevo campo obligatorio' }), { target: { value: 'resolution' } })
    fireEvent.click(screen.getByRole('button', { name: 'Agregar condición' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Nuevo campo obligatorio' }), { target: { value: 'resolution' } })
    expect((screen.getByRole('button', { name: 'Agregar condición' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre del campo' }), { target: { value: 'priority' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
    expect(screen.getByText('priority')).toBeTruthy()
  })
  it('does not offer task-only branch conditions on other resources or duplicate step approval', () => {
    render(<WorkflowGuardEditor guards={[]} onChange={vi.fn()} disabled={false} taskOnly={false} hasApprovalStep />)
    fireEvent.click(screen.getByRole('combobox', { name: 'Tipo de condición' }))
    expect(screen.queryByRole('option', { hidden: true, name: 'Rama de trabajo reportada' })).toBeNull()
    expect(screen.queryByRole('option', { hidden: true, name: 'Aprobación humana' })).toBeNull()
  })
  it('preserves existing guards and honors disabled editing', () => {
    const change = vi.fn()
    render(<WorkflowGuardEditor guards={[{ kind: 'human_approval' }, { kind: 'required_field', field: 'legacy' }]} onChange={change} disabled taskOnly />)
    expect(screen.getByText('legacy')).toBeTruthy()
    for (const button of screen.getAllByRole('button', { name: 'Quitar condición' })) fireEvent.click(button)
    expect(change).not.toHaveBeenCalled()
  })
})

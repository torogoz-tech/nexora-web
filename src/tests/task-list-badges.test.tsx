import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import TaskStatusBadges from '../components/TaskStatusBadges'
import TaskPriorityBadge from '../components/TaskPriorityBadge'
import type { VisibleTask } from '../types/VisibleTask'
it('keeps lifecycle separate from the pinned workflow state and its exact color', () => {
  const html = renderToStaticMarkup(
    <TaskStatusBadges
      task={
        {
          lifecycle: 'active',
          workflow_version_id: 'wfv_1',
          state_name: 'QA',
          state_color: '#4398AC',
        } as VisibleTask
      }
    />,
  )
  expect(html).toContain('En progreso')
  expect(html).toContain('QA')
  expect(html).toContain('color:#4398AC')
  expect(html).toContain('background-color:#4398AC1a')
  const pending = renderToStaticMarkup(
    <TaskStatusBadges
      task={
        {
          lifecycle: 'pending',
          workflow_version_id: null,
          state_name: null,
        } as VisibleTask
      }
    />,
  )
  expect(pending).toContain('Pendiente')
  expect(pending).not.toContain('QA')
})
it('uses distinct severity styles for every priority', () => {
  expect(
    renderToStaticMarkup(<TaskPriorityBadge priority="critical" />),
  ).toContain('text-error')
  expect(renderToStaticMarkup(<TaskPriorityBadge priority="high" />)).toContain(
    'text-orange',
  )
  expect(
    renderToStaticMarkup(<TaskPriorityBadge priority="medium" />),
  ).toContain('text-warning')
  expect(renderToStaticMarkup(<TaskPriorityBadge priority="low" />)).toContain(
    'text-info',
  )
})

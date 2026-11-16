import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { translate } from './translate'
import en from './en.json'
import es from './es.json'
import { LocaleContext } from '../app/LocaleContext'
import type { Language } from '../types/Language'
import { navigation } from '../app/navigation'
import ContextSidebar from '../layouts/ContextSidebar'
import Dropdown from '../components/Dropdown'
import InstallationLanguageForm from '../components/InstallationLanguageForm'
import DataMessage from '../components/DataMessage'
import TaskTypeIconPicker from '../components/TaskTypeIconPicker'
import WikiArticle from '../components/WikiArticle'
import { getKnowledgeSections } from '../utils/getKnowledgeSections'
import { parseInstallationPreferences } from '../utils/parseInstallationPreferences'
import type { ReactNode } from 'react'
function render(language: Language, children: ReactNode) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <LocaleContext.Provider
        value={{
          language,
          dateLocale: language === 'es' ? 'es-SV' : 'en-US',
          t: (source, params) => translate(language, source, params),
          applyPreferences: () => {},
        }}
      >
        {children}
      </LocaleContext.Provider>
    </MemoryRouter>,
  )
}
describe('installation language', () => {
  it('keeps matching resource keys and placeholders in both languages', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort())
    for (const [source, text] of Object.entries(en)) {
      expect(text.match(/\{\d+\}/g)?.sort() ?? [], source).toEqual(
        source.match(/\{\d+\}/g)?.sort() ?? [],
      )
      expect(text.trim(), source).not.toBe('')
    }
  })
  it('interpolates user content without translating it', () => {
    expect(translate('en', 'Ver tarea {0}', { '0': 'Documentos' })).toBe(
      'View task Documentos',
    )
    expect(translate('es', 'Ver tarea {0}', { '0': 'Documentos' })).toBe(
      'Ver tarea Documentos',
    )
    expect(translate('en', 'My custom project')).toBe('My custom project')
    expect(translate('en', null)).toBe('')
    expect(translate('en', 'constructor')).toBe('constructor')
    expect(translate('en', '__proto__')).toBe('__proto__')
  })
  it('translates static navigation metadata and account labels', () => {
    const settings = navigation.find((item) => item.id === 'settings')!
    expect(
      render('en', <ContextSidebar active={settings} onClose={() => {}} />),
    ).toContain('Task types')
    expect(
      render('en', <ContextSidebar active={settings} onClose={() => {}} />),
    ).toContain('Settings')
    expect(
      render('es', <ContextSidebar active={settings} onClose={() => {}} />),
    ).toContain('Configuración')
  })
  it('translates dropdown help without translating user supplied options', () => {
    const markup = render(
      'en',
      <Dropdown
        label="Project"
        value="p"
        options={[{ value: 'p', label: 'Documentos' }]}
        onChange={() => {}}
      />,
    )
    expect(markup).toContain('Documentos')
    expect(markup).not.toContain('>Documents<')
    expect(
      render(
        'en',
        <Dropdown label="Project" value="" options={[]} onChange={() => {}} />,
      ),
    ).toContain('Select an option')
  })
  it('translates service errors and icon names', () => {
    expect(
      render(
        'en',
        <DataMessage error="La sesión terminó. Inicia sesión de nuevo." />,
      ),
    ).toContain(translate('en', 'La sesión terminó. Inicia sesión de nuevo.'))
    expect(
      render('en', <TaskTypeIconPicker value="search" onChange={() => {}} />),
    ).toContain('Research')
  })
  it('translates article structure while preserving its title and body', () => {
    const sections = getKnowledgeSections({
      kind: 'document',
      body: { text: 'Documentos del proyecto' },
    })
    const markup = render(
      'en',
      <WikiArticle
        title="Reglas y decisiones"
        category="Document"
        sections={sections}
        metadata={[]}
      />,
    )
    expect(markup).toContain('Content')
    expect(markup).toContain('Documentos del proyecto')
    expect(markup).toContain('Reglas y decisiones')
  })
  it('renders General language controls and explanations in both languages', () => {
    const form = (
      <InstallationLanguageForm preferences={{ language: 'en', revision: 2 }} />
    )
    const english = render('en', form)
    expect(english).toContain('Instance language')
    expect(english).toContain(
      'Applies to the entire interface and every user, including sign-in.',
    )
    expect(english).not.toContain('Save changes')
    expect(english).toContain('radiogroup')
    expect(english).toContain('English')
    expect(render('es', form)).toContain('Idioma de la instancia')
  })
  it('rejects unsupported locales and invalid revisions', () => {
    expect(
      parseInstallationPreferences({ language: 'en', revision: 2 }),
    ).toEqual({ language: 'en', revision: 2 })
    expect(() =>
      parseInstallationPreferences({ language: 'fr', revision: 1 }),
    ).toThrow()
    expect(() =>
      parseInstallationPreferences({ language: 'es', revision: 0 }),
    ).toThrow()
  })
})

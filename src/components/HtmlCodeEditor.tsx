import { useEffect, useEffectEvent, useRef } from 'react'
import * as monaco from 'monaco-editor/editor/editor.api'
import 'monaco-editor/languages/definitions/html/register'
import 'monaco-editor/languages/definitions/css/register'
import 'monaco-editor/languages/features/html/register'
import 'monaco-editor/languages/features/css/register'
import 'monaco-editor/editor/contrib/find/browser/findController'
import 'monaco-editor/editor/contrib/contextmenu/browser/contextmenu'
import 'monaco-editor/editor/contrib/suggest/browser/suggestController'
import 'monaco-editor/editor/contrib/folding/browser/folding'
import 'monaco-editor/editor/contrib/bracketMatching/browser/bracketMatching'
import 'monaco-editor/editor/contrib/format/browser/formatActions'
import 'monaco-editor/editor/contrib/comment/browser/comment'
import 'monaco-editor/editor/contrib/linesOperations/browser/linesOperations'
import 'monaco-editor/editor/contrib/hover/browser/hoverContribution'
import { registerEmailParameterCompletions } from '../services/registerEmailParameterCompletions'
import { configureMonacoWorkers } from '../services/configureMonacoWorkers'
import { useTheme } from '../hooks/useTheme'
import { useTranslation } from '../hooks/useTranslation'
import type { HtmlCodeEditorProps } from '../types/HtmlCodeEditorProps'

export default function HtmlCodeEditor({ value, onChange, onSave, parameters = ['body','subject','organization_name'] }: HtmlCodeEditorProps) {
  const host = useRef<HTMLDivElement>(null)
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const label = t('Código HTML del correo')
  const change = useEffectEvent(onChange)
  const save = useEffectEvent(onSave)
  const initial = useRef({ value, label, parameters })
  useEffect(() => {
    if (!host.current) return
    configureMonacoWorkers()
    monaco.editor.defineTheme('nexora-dark', {
      base: 'vs-dark', inherit: true, rules: [],
      colors: { 'editor.background':'#000000', 'editorGutter.background':'#000000', 'editor.lineHighlightBackground':'#141414', 'editorLineNumber.foreground':'#666666' },
    })
    const model = monaco.editor.createModel(initial.current.value, 'html')
    const instance = monaco.editor.create(host.current, {
      model, editContext: false, automaticLayout: true, fontSize: 13, lineHeight: 22,
      minimap: { enabled: false }, lineNumbers: 'on', wordWrap: 'on',
      tabSize: 2, insertSpaces: true, scrollBeyondLastLine: false,
      padding: { top: 16, bottom: 16 }, folding: true,
      bracketPairColorization: { enabled: true }, formatOnPaste: true,
      autoClosingBrackets: 'always', autoClosingQuotes: 'always',
      ariaLabel: initial.current.label, accessibilitySupport: 'auto', fixedOverflowWidgets: true,
    })
    const completions = registerEmailParameterCompletions(model, initial.current.parameters)
    editor.current = instance
    const changes = instance.onDidChangeModelContent(() => change(instance.getValue()))
    const action = instance.addAction({
      id: 'nexora-save-template', label: 'Save template',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS], run: () => save(),
    })
    return () => {
      completions.dispose()
      changes.dispose()
      action.dispose()
      instance.dispose()
      model.dispose()
      editor.current = null
    }
  }, [])
  useEffect(() => {
    monaco.editor.setTheme(isDark ? 'nexora-dark' : 'vs')
  }, [isDark])
  useEffect(() => { editor.current?.updateOptions({ ariaLabel: label }) }, [label])
  useEffect(() => {
    const instance = editor.current
    if (instance && instance.getValue() !== value) {
      const model = instance.getModel()
      if (model) {
        instance.pushUndoStop()
        instance.executeEdits('external-update', [{range:model.getFullModelRange(),text:value}])
        instance.pushUndoStop()
      }
    }
  }, [value])
  return <div ref={host} className="h-[36rem] min-w-0" />
}

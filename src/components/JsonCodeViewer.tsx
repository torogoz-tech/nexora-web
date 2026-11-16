import { useEffect, useRef } from 'react'
import * as monaco from 'monaco-editor/editor/editor.api'
import 'monaco-editor/languages/features/json/register'
import 'monaco-editor/editor/contrib/find/browser/findController'
import 'monaco-editor/editor/contrib/contextmenu/browser/contextmenu'
import 'monaco-editor/editor/contrib/folding/browser/folding'
import 'monaco-editor/editor/contrib/bracketMatching/browser/bracketMatching'
import { configureMonacoWorkers } from '../services/configureMonacoWorkers'
import { useTheme } from '../hooks/useTheme'
import type { JsonCodeViewerProps } from '../types/JsonCodeViewerProps'
export default function JsonCodeViewer({ value, label, maxHeight=576 }: JsonCodeViewerProps) {
 const host = useRef<HTMLDivElement>(null), editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null), initial = useRef({ value, label })
 const { isDark } = useTheme()
 useEffect(() => {
  if (!host.current) return
  configureMonacoWorkers()
  monaco.editor.defineTheme('nexora-json-dark', { base: 'vs-dark', inherit: true, rules: [], colors: { 'editor.background': '#000000', 'editorGutter.background': '#000000', 'editor.lineHighlightBackground': '#141414', 'editorLineNumber.foreground': '#666666' } })
  const model = monaco.editor.createModel(initial.current.value, 'json')
  const instance = monaco.editor.create(host.current, { model, editContext: false, readOnly: true, domReadOnly: true, automaticLayout: true, minimap: { enabled: false }, fontSize: 13, lineHeight: 22, tabSize: 2, lineNumbers: 'on', wordWrap: 'off', scrollBeyondLastLine: false, padding: { top: 16, bottom: 16 }, folding: true, ariaLabel: initial.current.label, fixedOverflowWidgets: true })
  const resize=()=>{if(host.current)host.current.style.height=`${Math.max(100,Math.min(maxHeight,instance.getContentHeight()))}px`}
  const size=instance.onDidContentSizeChange(resize)
  resize()
  editor.current = instance
  return () => { size.dispose(); instance.dispose(); model.dispose(); editor.current = null }
 }, [maxHeight])
 useEffect(() => { monaco.editor.setTheme(isDark ? 'nexora-json-dark' : 'vs') }, [isDark])
 useEffect(() => { editor.current?.updateOptions({ ariaLabel: label }) }, [label])
 useEffect(() => { if (editor.current?.getValue() !== value) editor.current?.setValue(value) }, [value])
 return <div ref={host} style={{height:Math.max(100,Math.min(maxHeight,value.split('\n').length*22+32))}} className="min-w-0 overflow-hidden rounded-xl border border-base-300"/>
}

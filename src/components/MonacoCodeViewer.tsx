import { useEffect, useRef } from 'react'
import * as monaco from 'monaco-editor/editor/editor.api'
import 'monaco-editor/languages/features/json/register'
import 'monaco-editor/languages/definitions/csharp/register'
import 'monaco-editor/languages/definitions/typescript/register'
import 'monaco-editor/languages/definitions/javascript/register'
import 'monaco-editor/languages/definitions/css/register'
import 'monaco-editor/languages/definitions/html/register'
import 'monaco-editor/languages/definitions/markdown/register'
import 'monaco-editor/languages/definitions/rust/register'
import 'monaco-editor/languages/definitions/python/register'
import 'monaco-editor/editor/contrib/find/browser/findController'
import 'monaco-editor/editor/contrib/contextmenu/browser/contextmenu'
import 'monaco-editor/editor/contrib/folding/browser/folding'
import 'monaco-editor/editor/contrib/bracketMatching/browser/bracketMatching'
import { configureMonacoWorkers } from '../services/configureMonacoWorkers'
import { useTheme } from '../hooks/useTheme'
import type { CodeViewerProps } from '../types/CodeViewerProps'
export default function MonacoCodeViewer({ code: value, language = 'plaintext', label = 'Código', height = 144 }: CodeViewerProps) {
 const host = useRef<HTMLDivElement>(null), editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null), initial = useRef({ value, label, language })
 const decorations = useRef<monaco.editor.IEditorDecorationsCollection | null>(null)
 const { isDark } = useTheme()
 useEffect(() => {
  if (!host.current) return
  configureMonacoWorkers()
  if(!monaco.languages.getLanguages().some(item=>item.id==='diff')){
   monaco.languages.register({id:'diff'})
   monaco.languages.setMonarchTokensProvider('diff',{tokenizer:{root:[[/^\+.*/,'inserted'],[/^-.*/,'deleted'],[/^@@.*/,'metatag'],[/^diff .*/,'keyword']]}})
  }
  monaco.editor.defineTheme('nexora-json-dark', { base: 'vs-dark', inherit: true, rules: [{token:'inserted',foreground:'34d399'},{token:'deleted',foreground:'f87171'},{token:'metatag',foreground:'60a5fa'}], colors: { 'editor.background': '#000000', 'editorGutter.background': '#000000', 'editor.lineHighlightBackground': '#141414', 'editorLineNumber.foreground': '#666666' } })
  const model = monaco.editor.createModel(initial.current.value, initial.current.language)
  const instance = monaco.editor.create(host.current, { model, editContext: false, readOnly: true, domReadOnly: true, automaticLayout: true, minimap: { enabled: false }, fontSize: 13, lineHeight: 22, tabSize: 2, lineNumbers: 'on', wordWrap: 'off', scrollBeyondLastLine: false, padding: { top: 16, bottom: 16 }, folding: true, ariaLabel: initial.current.label, fixedOverflowWidgets: true })
  editor.current = instance
  decorations.current=instance.createDecorationsCollection()
  return () => { instance.dispose(); model.dispose(); editor.current = null }
 }, [])
 useEffect(() => { monaco.editor.setTheme(isDark ? 'nexora-json-dark' : 'vs') }, [isDark])
 useEffect(() => { editor.current?.updateOptions({ ariaLabel: label }) }, [label])
 useEffect(() => { if (editor.current?.getValue() !== value) editor.current?.setValue(value) }, [value])
 useEffect(()=>{
  const model=editor.current?.getModel();if(!model)return;monaco.editor.setModelLanguage(model,language)
  decorations.current?.set(language==='diff'?value.split('\n').flatMap((line,index)=>line.startsWith('+')&&!line.startsWith('+++')||line.startsWith('-')&&!line.startsWith('---')?[{range:new monaco.Range(index+1,1,index+1,1),options:{isWholeLine:true,className:line.startsWith('+')?'git-diff-added':'git-diff-removed',linesDecorationsClassName:line.startsWith('+')?'git-diff-added-gutter':'git-diff-removed-gutter'}}]:[]):[])
 },[value,language])
 return <div ref={host} style={{height}} className="min-w-0 overflow-hidden rounded-xl border border-base-300"/>
}

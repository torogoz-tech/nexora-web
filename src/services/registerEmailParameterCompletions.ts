import * as monaco from 'monaco-editor/editor/editor.api'
export function registerEmailParameterCompletions(model: monaco.editor.ITextModel, parameters: string[]) {
  return monaco.languages.registerCompletionItemProvider('html', {
    triggerCharacters: ['{'],
    provideCompletionItems(current,position) {
      if (current !== model) return {suggestions:[]}
      const before = current.getLineContent(position.lineNumber).slice(0,position.column-1)
      const prefix = before.match(/\{\{?[a-z_]*$/)?.[0] ?? ''
      return {suggestions:parameters.map(name=>({
        label:`{{${name}}}`,kind:monaco.languages.CompletionItemKind.Variable,insertText:`{{${name}}}`,
        range:new monaco.Range(position.lineNumber,position.column-prefix.length,position.lineNumber,position.column),
      }))}
    },
  })
}

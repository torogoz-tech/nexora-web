// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { useState } from 'react'
import TaskAcceptanceCriteriaEditor from '../src/components/TaskAcceptanceCriteriaEditor'
import { prepareBoardTaskInput } from '../src/utils/prepareBoardTaskInput'
import { parseWeeklyRating } from '../src/utils/parseWeeklyRating'
afterEach(cleanup)
it('adds, edits and removes multiple independent criteria',()=>{
 function Form(){const [value,setValue]=useState<string[]>([]);return <TaskAcceptanceCriteriaEditor value={value} onChange={setValue}/>}
 render(<Form/>);
 fireEvent.click(screen.getByRole('button',{name:'Agregar criterio'}));
 fireEvent.click(screen.getByRole('button',{name:'Agregar criterio'}));
 const fields=screen.getAllByRole('textbox');expect(fields).toHaveLength(2);
 fireEvent.change(fields[0],{target:{value:'First'}});fireEvent.change(fields[1],{target:{value:'Second'}});
 fireEvent.click(screen.getAllByRole('button',{name:'Eliminar criterio'})[0]);
 expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Second');
})
it('preserves multiple Markdown criteria and rejects empty items',()=>{
 const input={title:'Task',context:'',typeCode:'task',priority:'medium' as const,acceptanceCriteria:[' **One** ','Two']};
 expect(prepareBoardTaskInput(input).acceptanceCriteria).toEqual(['**One**','Two']);
 expect(()=>prepareBoardTaskInput({...input,acceptanceCriteria:[' ']})).toThrow();
})
it('parses only a valid weekly score payload',()=>{
 expect(parseWeeklyRating({start:'2026-11-09',end:'2026-11-15',score:4.5})).toEqual({start:'2026-11-09',end:'2026-11-15',score:4.5});
 expect(()=>parseWeeklyRating({start:'2026-11-09',end:'2026-11-15',score:7})).toThrow();
})

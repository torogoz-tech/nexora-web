// @vitest-environment jsdom
import { useState } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import OtpCodeInput from '../src/components/OtpCodeInput'
import TotpSetupScreen from '../src/components/TotpSetupScreen'
import TotpVerificationScreen from '../src/components/TotpVerificationScreen'
afterEach(cleanup)
function Harness(){const [value,onChange]=useState('');return <><OtpCodeInput value={value} onChange={onChange}/><output data-testid="value">{value}</output></>}
it('advances focus, deletes backward, and preserves the positions of remaining digits',()=>{
 render(<Harness/>);const boxes=screen.getAllByRole('textbox') as HTMLInputElement[]
 boxes[0].focus();fireEvent.change(boxes[0],{target:{value:'1'}})
 expect(document.activeElement).toBe(boxes[1])
 fireEvent.change(boxes[1],{target:{value:'2'}})
 expect(document.activeElement).toBe(boxes[2])
 fireEvent.change(boxes[2],{target:{value:'3'}})
 fireEvent.keyDown(boxes[1],{key:'Backspace'})
 expect(document.activeElement).toBe(boxes[0]);expect(boxes[1].value).toBe('');expect(boxes[2].value).toBe('3')
 expect(screen.getByTestId('value').textContent).toBe('1 3')
})
it('accepts a full pasted code from any box and preserves leading zeroes',()=>{
 render(<Harness/>);const boxes=screen.getAllByRole('textbox') as HTMLInputElement[]
 fireEvent.paste(boxes[3],{clipboardData:{getData:()=> '000 123'}})
 expect(boxes.map(box=>box.value).join('')).toBe('000123')
 expect(screen.getByTestId('value').textContent).toBe('000123');expect(document.activeElement).toBe(boxes[5])
})
it('supports one-time-code autofill and arrow navigation without entering letters',()=>{
 render(<Harness/>);const boxes=screen.getAllByRole('textbox') as HTMLInputElement[]
 fireEvent.change(boxes[0],{target:{value:'654321'}})
 expect(boxes.map(box=>box.value).join('')).toBe('654321')
 fireEvent.keyDown(boxes[5],{key:'ArrowLeft'});expect(document.activeElement).toBe(boxes[4])
 fireEvent.change(boxes[4],{target:{value:'x'}});expect(screen.getByTestId('value').textContent).toBe('654321')
 expect(boxes[0].autocomplete).toBe('one-time-code')
})
it('keeps QR linking separate from entering a code and hides the manual key by default',()=>{
 const {container}=render(<TotpSetupScreen secret="TESTKEY" uri="otpauth://totp/Test?secret=TESTKEY" busy={false} onSetup={()=>{}} onContinue={()=>{}}/>)
 expect(screen.queryByRole('textbox')).toBeNull();expect(container.querySelector('svg')).not.toBeNull();expect(container.querySelector('details')?.open).toBe(false)
 expect(screen.getByRole('button',{name:'Continuar'})).toBeTruthy()
})
it('only submits six complete digits and never renders the QR on the verification screen',()=>{
 const verify=vi.fn();const props={busy:false,invalid:false,enrolling:true,onChange:vi.fn(),onVerify:verify,onBack:vi.fn()}
 const {container,rerender}=render(<TotpVerificationScreen {...props} code="1 3456"/>)
 expect(container.querySelector('svg')).toBeNull()
 expect((screen.getByRole('button',{name:'Verificar y continuar'}) as HTMLButtonElement).disabled).toBe(true)
 fireEvent.submit(container.querySelector('form')!);expect(verify).not.toHaveBeenCalled()
 rerender(<TotpVerificationScreen {...props} code="123456"/>);fireEvent.submit(container.querySelector('form')!);expect(verify).toHaveBeenCalledTimes(1)
})

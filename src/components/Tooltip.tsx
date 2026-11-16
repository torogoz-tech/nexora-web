import {useEffect,useId,useRef} from 'react'
import type {ReactNode} from 'react'
export default function Tooltip({label,children,className=''}:{label:ReactNode;children:ReactNode;className?:string}){
 const id=useId(),tip=useRef<HTMLSpanElement>(null),trigger=useRef<HTMLSpanElement>(null),opened=useRef(false)
 const hide=()=>{if(opened.current&&tip.current){tip.current.hidePopover?.();tip.current.hidden=true;opened.current=false}}
 const show=()=>{const p=tip.current,r=trigger.current;if(!p||!r)return;p.hidden=false;if(!opened.current){p.showPopover?.();opened.current=true;}const box=r.getBoundingClientRect(),bounds=p.getBoundingClientRect(),gap=8,margin=8;const below=box.top<bounds.height+gap+margin;const left=Math.max(margin,Math.min(window.innerWidth-bounds.width-margin,box.left+box.width/2-bounds.width/2));const top=below?box.bottom+gap:box.top-bounds.height-gap;p.style.left=`${left}px`;p.style.top=`${Math.max(margin,Math.min(top,window.innerHeight-bounds.height-margin))}px`}
 useEffect(()=>{window.addEventListener('scroll',hide,true);window.addEventListener('resize',hide);return()=>{window.removeEventListener('scroll',hide,true);window.removeEventListener('resize',hide)}},[])
 return <span ref={trigger} className={`inline-flex shrink-0 ${className}`} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} onKeyDown={e=>{if(e.key==='Escape')hide()}} aria-describedby={id}>{children}<span ref={tip} id={id} hidden popover="manual" role="tooltip" className="pointer-events-none fixed inset-auto m-0 z-[2147483647] max-w-[min(20rem,calc(100vw-1rem))] rounded-lg border border-base-300 bg-base-300 px-3 py-2 text-center text-xs font-medium leading-relaxed text-base-content shadow-xl">{label}</span></span>
}

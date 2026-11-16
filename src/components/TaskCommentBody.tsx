import WikiMarkdown from './WikiMarkdown'
import {taskStickers} from '../app/taskStickers'
export default function TaskCommentBody({body}:{body:string}){return <div className="break-words text-sm leading-relaxed">{body.split(/(\[sticker:[a-z]+\])/g).map((part,i)=>{const sticker=taskStickers.find(s=>part===`[sticker:${s.id}]`);return sticker?<span key={i} role="img" aria-label={sticker.label} className="mx-1 inline-block rounded-2xl bg-base-200 p-3 align-middle text-5xl">{sticker.emoji}</span>:<WikiMarkdown key={i} text={part} allowImages/>})}</div>}

import {expect,it} from 'vitest'
import {parseEmailContent} from '../utils/parseEmailContent'
it('accepts the workflow notification template returned in the organization email catalog',()=>{
 const template={kind:'workflow_transition',language:'es',subject:'Tarea actualizada',body_html:'<p>{{resource_id}}</p>',default_subject:'Tarea actualizada',default_body_html:'<p>{{resource_id}}</p>',revision:1,customized:false,delivery_enabled:true,parameters:[]}
 expect(parseEmailContent(template)).toEqual(template)
})

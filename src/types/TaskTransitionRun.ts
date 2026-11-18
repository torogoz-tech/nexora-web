export type TaskTransitionRun = {
 execution_kind?:string
 id:string
 task_id:string
 transition_id:string
 task_revision:number
 actor_id:string
 parameters:Record<string,unknown>
 approval_request_id?:string|null
 status:'ready'|'running'|'waiting_approval'|'waiting_external'|'waiting_knowledge'|'failed'|'succeeded'
 next_step:number
 advanced:boolean
 outcomes:{step_index:number;kind:string;result:unknown}[]
 error_code?:string|null
 message?:string|null
}

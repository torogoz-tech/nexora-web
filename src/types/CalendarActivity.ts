export type CalendarActivity = {
  work_block?: boolean
  id: string
  created_by: string
  creator_name: string
  title: string
  description: string
  mode?: 'virtual' | 'in_person' | null
  attendance_required?: boolean
  my_attendance?: 'attending' | 'declined' | null
  attending_count?: number
  declined_count?: number
  location: string
  start_date: string
  end_date: string
  all_day: boolean
  start_time: string | null
  end_time: string | null
  revision: number
  can_edit: boolean
}

// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import MemberWeeklyRating from '../src/components/MemberWeeklyRating'
import { useApiData } from '../src/hooks/useApiData'
vi.mock('../src/hooks/useApiData',()=>({useApiData:vi.fn()}))
afterEach(()=>{cleanup();vi.clearAllMocks()})
it('shows own weekly average without requesting individual evaluations',()=>{
 vi.mocked(useApiData).mockImplementation(path=>({data:path==='/api/v1/me/weekly-rating'?{start:'2026-11-09',end:'2026-11-15',score:4.5}:null,loading:false,error:null,reload:()=>{}}) as ReturnType<typeof useApiData>)
 render(<MemberWeeklyRating own memberId="self" today="2026-11-10"/>);
 expect(screen.getByText(/4[,.]5 \/ 5/)).toBeTruthy();
 expect(vi.mocked(useApiData).mock.calls.map(call=>call[0]).filter(Boolean)).toEqual(['/api/v1/me/weekly-rating']);
})

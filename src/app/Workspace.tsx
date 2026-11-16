import ServiceRequestTypeEditorPage from '../pages/ServiceRequestTypeEditorPage'
import ServiceRequestTypesPage from '../pages/ServiceRequestTypesPage'
import ProductsPage from '../pages/ProductsPage'
import RequestPages from './RequestPages'
import ReleasesPage from '../pages/ReleasesPage'
import FeatureDetailsPage from '../pages/FeatureDetailsPage'
import FeatureProposalPage from '../pages/FeatureProposalPage'
import ApprovalsPage from '../pages/ApprovalsPage'
import NotificationInboxPage from '../pages/NotificationInboxPage'
import DailyDeveloperAnalysisPage from '../pages/DailyDeveloperAnalysisPage'
import TeamMembersPage from '../pages/TeamMembersPage'
import CalendarActivityDetailPage from '../pages/CalendarActivityDetailPage'
import RepositoryCommitPage from '../pages/RepositoryCommitPage'
import RepositoryFilesPage from '../pages/RepositoryFilesPage'
import TaskCreatePage from '../pages/TaskCreatePage'
import CalendarActivityEditorPage from '../pages/CalendarActivityEditorPage'
import TaskDetailPage from '../pages/TaskDetailPage'
import McpSettingsPage from '../pages/McpSettingsPage'
import PersonalMcpHistoryPage from '../pages/PersonalMcpHistoryPage'
import CodeReviewsPage from '../pages/CodeReviewsPage'
import TaskTypeEditorPage from '../pages/TaskTypeEditorPage'
import LaborCalendarHistoryPage from '../pages/LaborCalendarHistoryPage'
import GitAuthorsPage from '../pages/GitAuthorsPage'
import StickersPage from '../pages/StickersPage'
import AnalysisProfilesPage from '../pages/AnalysisProfilesPage'
import AnalysisProfileDetailPage from '../pages/AnalysisProfileDetailPage'
import ProjectProfilePage from '../pages/ProjectProfilePage'
import LaborCalendarPage from '../pages/LaborCalendarPage'
import WorkingHoursPage from '../pages/WorkingHoursPage'
import OvertimePage from '../pages/OvertimePage'
import DeveloperRatingsPage from '../pages/DeveloperRatingsPage'
import RepositoryProfilePage from '../pages/RepositoryProfilePage'
import { UserRound } from 'lucide-react'
import MemberProfilePage from '../pages/MemberProfilePage'
import PersonalSecurityPage from '../pages/PersonalSecurityPage'
import OpenAiPage from '../pages/OpenAiPage'
import OidcPage from '../pages/OidcPage'
import SmtpPage from '../pages/SmtpPage'
import GitIntegrationPage from '../pages/GitIntegrationPage'
import MembersPage from '../pages/MembersPage'
import EmailContentsPage from '../pages/EmailContentsPage'
import EmailContentEditorPage from '../pages/EmailContentEditorPage'
import EmailTemplatePage from '../pages/EmailTemplatePage'
import NotificationsPage from '../pages/NotificationsPage'
import GeneralPage from '../pages/GeneralPage'
import WorkNavigationProvider from './WorkNavigationProvider'
import TaskTypesPage from '../pages/TaskTypesPage'
import TasksPage from '../pages/TasksPage'
import BoardsPage from '../pages/BoardsPage'
import WorkflowBoardPage from '../pages/WorkflowBoardPage'
import WorkflowVersionsPage from '../pages/WorkflowVersionsPage'
import WorkflowsPage from '../pages/WorkflowsPage'
import WorkflowEditorPage from '../pages/WorkflowEditorPage'
import AccountsPage from '../pages/AccountsPage'
import IntegrationsPage from '../pages/IntegrationsPage'
import RepositoriesPage from '../pages/RepositoriesPage'
import PullRequestsPage from '../pages/PullRequestsPage'
import PullRequestDetailPage from '../pages/PullRequestDetailPage'
import { Navigate, useLocation } from 'react-router'
import AppLayout from '../layouts/AppLayout'
import { useTranslation } from '../hooks/useTranslation'
import { useNavigation } from '../hooks/useNavigation'
import ProjectsPage from '../pages/ProjectsPage'
import WorkspacePage from '../pages/WorkspacePage'
import { lazy, Suspense } from 'react'
import DataMessage from '../components/DataMessage'
const FeatureCatalogPage = lazy(() => import('../pages/FeatureCatalogPage'))
const KnowledgeEditorPage = lazy(() => import('../pages/KnowledgeEditorPage'))
const KnowledgePage = lazy(() => import('../pages/KnowledgePage'))
export default function Workspace() {
  const { language } = useTranslation()
  const active = useNavigation()
  const location = useLocation()
  if(location.pathname==='/requests'||location.pathname.startsWith('/requests/'))return <AppLayout active={active}><RequestPages/></AppLayout>
  const knowledgeEditor=location.pathname.match(/^\/knowledge\/editor\/(new|[A-Za-z0-9_-]+)$/)
  if(knowledgeEditor)return <WorkNavigationProvider area="knowledge"><AppLayout active={active}><Suspense fallback={<DataMessage loading/>}><KnowledgeEditorPage id={knowledgeEditor[1]==='new'?undefined:knowledgeEditor[1]}/></Suspense></AppLayout></WorkNavigationProvider>
  const proposalDetail=location.pathname.match(/^\/knowledge\/features\/proposals\/([A-Za-z0-9_-]+)$/)
  if(proposalDetail)return <WorkNavigationProvider area="knowledge"><AppLayout active={active}><FeatureProposalPage id={proposalDetail[1]}/></AppLayout></WorkNavigationProvider>
  const featureDetail=location.pathname.match(/^\/knowledge\/features\/([A-Za-z0-9_-]+)$/)
  if(featureDetail)return <WorkNavigationProvider area="knowledge"><AppLayout active={active}><FeatureDetailsPage id={featureDetail[1]}/></AppLayout></WorkNavigationProvider>
  const activityEditor=location.pathname.match(/^\/calendar\/activities\/(new|[A-Za-z0-9_-]+\/edit)$/)
  const activityDetail=location.pathname.match(/^\/calendar\/activities\/([A-Za-z0-9_-]+)$/)
  const taskNew = location.pathname === '/tasks/new'
  const taskDetail = location.pathname.match(/^\/tasks\/([A-Za-z0-9_-]+)$/)
  const mcpHistory=location.pathname==='/settings/mcp/history'
  const personalSecurity=location.pathname==='/settings/security'
  const taskTypeEditor = location.pathname.match(/^\/settings\/task-types\/([a-z0-9_-]+)\/edit$/)
  const requestTypeEditor = location.pathname.match(/^\/settings\/request-types\/([A-Za-z0-9_-]+)\/edit$/)
  const requestTypeNew = location.pathname === '/settings/request-types/new'
  const taskTypeNew = location.pathname === '/settings/task-types/new'
  const calendarHistory = location.pathname === '/settings/labor-calendar/history'
  const analysisProfile = location.pathname.match(/^\/settings\/analysis-profiles\/([A-Za-z0-9_-]+)$/)
  const emailContent = location.pathname.match(/^\/settings\/email-template\/([a-z_]+)\/(es|en)$/)
  const gitIntegration = location.pathname.match(/^\/settings\/integrations\/(github|gitlab)$/)
  const emailLayout = location.pathname === '/settings/email-template/layout'
  const board = location.pathname.match(/^\/boards\/([A-Za-z0-9_-]+)$/)
  const detail = location.pathname.match(/^\/code\/pull-requests\/([1-9]\d*)$/)
  const workflowVersions = location.pathname.match(
    /^\/settings\/workflows\/([A-Za-z0-9_-]+)\/versions$/,
  )
  const workflowProperty = location.pathname.match(
    /^\/settings\/workflows\/([A-Za-z0-9_-]+)\/(states|transitions)\/([A-Za-z0-9_-]+)$/,
  )
  const workflowEditor = location.pathname.match(
    /^\/settings\/workflows\/([A-Za-z0-9_-]+)$/,
  )
  const page = active.items.find(
    (item) =>
      item.path ===
      (activityEditor||activityDetail?'/calendar':taskNew || taskDetail ? '/tasks' : mcpHistory
        ? '/settings/mcp'
        : requestTypeEditor || requestTypeNew ? '/settings/request-types'
        : taskTypeEditor || taskTypeNew
        ? '/settings/task-types'
        : calendarHistory
        ? '/settings/labor-calendar'
        : analysisProfile
        ? '/settings/analysis-profiles'
        : gitIntegration
        ? '/settings/integrations'
        : emailContent || emailLayout
        ? '/settings/email-template'
        : board
        ? '/boards'
          : workflowEditor || workflowVersions || workflowProperty
          ? '/settings/workflows'
          : detail
            ? '/code/pull-requests'
            : location.pathname),
  )
  const repositoryCommit=location.pathname.match(/^\/code\/repositories\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_-]+)\/commits\/([a-f0-9]{40,64})$/)
  if(repositoryCommit)return <WorkNavigationProvider area="code"><AppLayout active={{...active,id:'code'}} wide hideContext><RepositoryCommitPage key={location.pathname} projectId={repositoryCommit[1]} repositoryId={repositoryCommit[2]} sha={repositoryCommit[3]}/></AppLayout></WorkNavigationProvider>
  const repositoryFiles=location.pathname.match(/^\/code\/repositories\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_-]+)\/files$/)
  if(repositoryFiles)return <WorkNavigationProvider area="code"><AppLayout active={{...active,id:'code'}} wide><RepositoryFilesPage projectId={repositoryFiles[1]} repositoryId={repositoryFiles[2]}/></AppLayout></WorkNavigationProvider>
  const projectProfile=location.pathname.match(/^\/projects\/([A-Za-z0-9_-]+)$/)
  const registeredProfile=location.pathname.match(/^\/code\/repositories\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_-]+)$/)
  const remoteProfile=location.pathname.match(/^\/code\/accounts\/([A-Za-z0-9_-]+)\/repositories\/([A-Za-z0-9_-]+)$/)
  if(projectProfile||registeredProfile||remoteProfile){
    const area=projectProfile?'settings':'code'
    return <WorkNavigationProvider area={area}><AppLayout active={{...active,id:area}} wide hideContext>{projectProfile?<ProjectProfilePage key={projectProfile[1]} projectId={projectProfile[1]}/>:registeredProfile?<RepositoryProfilePage key={`registered:${registeredProfile[1]}:${registeredProfile[2]}`} projectId={registeredProfile[1]} repositoryId={registeredProfile[2]}/>:<RepositoryProfilePage key={`remote:${remoteProfile![1]}:${remoteProfile![2]}`} connectionId={remoteProfile![1]} remoteId={remoteProfile![2]}/>}</AppLayout></WorkNavigationProvider>
  }
  if (location.pathname === '/notifications')
    return <WorkNavigationProvider area="profile"><AppLayout active={{...active,id:'profile'}} wide hideContext><NotificationInboxPage /></AppLayout></WorkNavigationProvider>
  const memberProfile = location.pathname.match(/^\/settings\/members\/([A-Za-z0-9_-]+)$/)
  if(location.pathname==='/profile/mcp-history') return <Navigate to="/settings/mcp/history" replace/>
  if (memberProfile || location.pathname === '/profile')
    return <WorkNavigationProvider area="profile"><AppLayout active={{id:'profile',label:'Mi perfil',description:'Perfil y actividad de trabajo.',icon:UserRound,items:[]}} wide hideContext><MemberProfilePage key={memberProfile?.[1]??'self'} memberId={memberProfile?.[1]}/></AppLayout></WorkNavigationProvider>
  if (location.pathname === '/knowledge/code-reviews')
    return <Navigate to={`${new URLSearchParams(location.search).has('article')?'/code/knowledge':'/code/code-reviews'}${location.search}${location.hash}`} replace />
  if (location.pathname === '/tasks/board')
    return <Navigate to={`/boards${location.search}`} replace />
  if (!page) return <Navigate to="/profile" replace />
  if (emailContent && emailContent[2] !== language)
    return <Navigate to={`/settings/email-template/${emailContent[1]}/${language}`} replace />
  return (
    <WorkNavigationProvider area={active.id}>
      <AppLayout active={active}>
        {page.path==='/team/members'?<TeamMembersPage/>:activityDetail&&!activityEditor?<CalendarActivityDetailPage key={activityDetail[1]} id={activityDetail[1]!}/> : activityEditor?<CalendarActivityEditorPage key={location.pathname} id={activityEditor[1]==='new'?undefined:activityEditor[1]!.split('/')[0]}/> : taskNew ? <TaskCreatePage key={location.key}/> : taskDetail ? <TaskDetailPage key={taskDetail[1]} id={taskDetail[1]}/> : mcpHistory ? (<PersonalMcpHistoryPage/>) : page.path === '/settings/mcp' ? (<McpSettingsPage/>) : personalSecurity ? (<PersonalSecurityPage />) : taskTypeEditor || taskTypeNew ? (
          <TaskTypeEditorPage key={location.pathname} code={taskTypeEditor?.[1]}/>
        ) : calendarHistory ? (
          <LaborCalendarHistoryPage/>
        ) : analysisProfile ? (
          <AnalysisProfileDetailPage key={analysisProfile[1]} id={analysisProfile[1]}/>
        ) : gitIntegration ? (
          <GitIntegrationPage key={gitIntegration[1]} provider={gitIntegration[1] as 'github' | 'gitlab'} />
        ) : emailContent ? (
          <EmailContentEditorPage key={location.pathname} kind={emailContent[1]} language={emailContent[2]} />
        ) : emailLayout ? (
          <EmailTemplatePage />
        ) : workflowProperty ? (
          <WorkflowEditorPage
            key={location.pathname + location.search}
            id={workflowProperty[1]}
            focus={{ kind: workflowProperty[2] === 'states' ? 'state' : 'transition', id: workflowProperty[3] }}
          />
        ) : workflowVersions ? (
          <WorkflowVersionsPage
            key={location.pathname + location.search}
            id={workflowVersions[1]}
          />
        ) : workflowEditor ? (
          <WorkflowEditorPage
            key={location.pathname + location.search}
            id={workflowEditor[1] === 'new' ? undefined : workflowEditor[1]}
          />
        ) : page.path === '/settings/workflows' ? (
          <WorkflowsPage />
        ) : board ? (
          <WorkflowBoardPage key={board[1]} id={board[1]} />
        ) : page.path === '/boards' ? (
          <BoardsPage />
        ) : page.path === '/tasks' ? (
          <TasksPage />
        ) : page.path === '/settings/products' ? (<ProductsPage/>) : page.path === '/settings/members' ? (
          <MembersPage />
        ) : page.path === '/settings/labor-calendar' ? (
          <LaborCalendarPage settingsView />
        ) : page.path === '/settings/working-hours' ? (
          <WorkingHoursPage />
        ) : page.path === '/approvals' ? (
          <ApprovalsPage />
        ) : page.path === '/overtime' ? (
          <OvertimePage />
        ) : page.path === '/calendar' ? (
          <LaborCalendarPage />
        ) : page.path === '/ratings' ? (
          <DeveloperRatingsPage />
        ) : page.path === '/settings/projects' || page.path === '/team/projects' ? (
          <ProjectsPage />
        ) : page.path === '/settings' ? (
          <GeneralPage />
        ) : page.path === '/settings/openai' ? (
          <OpenAiPage />
        ) : page.path === '/settings/oidc' ? (
          <OidcPage />
        ) : page.path === '/settings/email' ? (
          <SmtpPage />
        ) : page.path === '/settings/email-template' ? (
          <EmailContentsPage />
        ) : requestTypeEditor || requestTypeNew ? (<ServiceRequestTypeEditorPage id={requestTypeEditor?.[1]} />) : page.path === '/settings/request-types' ? (
          <ServiceRequestTypesPage />
        ) : page.path === '/settings/task-types' ? (
          <TaskTypesPage />
        ) : page.path === '/settings/notifications' ? (
          <NotificationsPage />
        ) : page.path === '/settings/accounts' ? (
          <AccountsPage />
        ) : page.path === '/settings/stickers' ? (
          <StickersPage/>
        ) : page.path === '/settings/analysis-profiles' ? (
          <AnalysisProfilesPage/>
        ) : page.path === '/settings/integrations' ? (
          <IntegrationsPage />
        ) : page.path === '/knowledge/features' ? (
          <Suspense fallback={<DataMessage loading />}><FeatureCatalogPage /></Suspense>
        ) : page.path.startsWith('/knowledge') || page.path === '/code/knowledge' ? (
          <Suspense fallback={<DataMessage loading />}>
            <KnowledgePage key={page.path} section={page} />
          </Suspense>
        ) : page.path === '/code/releases' ? (
          <ReleasesPage/>
        ) : page.path === '/code/code-reviews' ? (
          <CodeReviewsPage/>
        ) : page.path === '/code/analyses' ? (
          <DailyDeveloperAnalysisPage/>
        ) : page.path === '/code/authors' ? (
          <GitAuthorsPage />
        ) : page.path === '/code' ? (
          <RepositoriesPage />
        ) : detail ? (
          <PullRequestDetailPage
            key={location.pathname}
            number={Number(detail[1])}
          />
        ) : page.path === '/code/pull-requests' ? (
          <PullRequestsPage />
        ) : (
          <WorkspacePage key={page.path} section={page} />
        )}
      </AppLayout>
    </WorkNavigationProvider>
  )
}

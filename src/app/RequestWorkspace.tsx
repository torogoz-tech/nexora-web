import { Link, Navigate, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import RequestPages from './RequestPages'
import McpSettingsPage from '../pages/McpSettingsPage'
import PersonalMcpHistoryPage from '../pages/PersonalMcpHistoryPage'
import MemberProfilePage from '../pages/MemberProfilePage'
import PersonalSecurityPage from '../pages/PersonalSecurityPage'
export default function RequestWorkspace(){const {session,logout}=useAuth();const {t}=useTranslation();const {pathname}=useLocation();const allowed=pathname.startsWith('/requests')||pathname.startsWith('/settings/mcp')||pathname==='/settings/security'||pathname==='/profile';if(!allowed)return <Navigate to="/requests" replace/>;return <div className="min-h-screen bg-base-100 text-base-content"><header className="flex flex-wrap items-center justify-between gap-4 border-b border-base-300 px-6 py-4"><Link to="/requests" className="font-semibold">{t('Mesa de ayuda')}</Link><nav className="flex flex-wrap items-center gap-5 text-sm"><Link to="/requests">{t('Solicitudes')}</Link><Link to="/requests/reports">{t('Reportes')}</Link><Link to="/profile">{t('Mi perfil')}</Link><Link to="/settings/security">{t('Seguridad personal')}</Link><Link to="/settings/mcp">{t('Acceso MCP')}</Link><span>{session?.displayName}</span><button className="btn btn-sm btn-ghost" onClick={()=>void logout()}>{t('Cerrar sesión')}</button></nav></header><main className="w-full px-4 py-8 pb-16 sm:px-6">{pathname==='/settings/mcp'?<McpSettingsPage/>:pathname==='/settings/mcp/history'?<PersonalMcpHistoryPage/>:pathname==='/settings/security'?<PersonalSecurityPage/>:pathname==='/profile'?<MemberProfilePage/>:<RequestPages/>}</main></div>}

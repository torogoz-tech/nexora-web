import { Navigate, Route, Routes, useLocation } from 'react-router'
import ProtectedRoute from '../components/ProtectedRoute'
import LoginPage from '../pages/LoginPage'
import AccessGatePage from '../pages/AccessGatePage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import AcceptInvitationPage from '../pages/AcceptInvitationPage'
import Workspace from './Workspace'
import WorkspaceNavigationProvider from './WorkspaceNavigationProvider'
import { getLegacyWorkspacePath } from '../utils/getLegacyWorkspacePath'
export default function App() {
  const location = useLocation()
  const legacy = getLegacyWorkspacePath(location.pathname)
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/access" element={<AccessGatePage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/invitations/accept" element={<AcceptInvitationPage />} />
      <Route element={<ProtectedRoute />}>
        <Route
          path="*"
          element={
            legacy ? (
              <Navigate to={legacy + location.search} replace />
            ) : (
              <WorkspaceNavigationProvider><Workspace /></WorkspaceNavigationProvider>
            )
          }
        />
      </Route>
    </Routes>
  )
}

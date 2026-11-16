import { useContext } from 'react'
import { authContext } from '../app/authContext'
export function useAuth() {
  const context = useContext(authContext)
  if (!context) throw new Error('AuthProvider is required')
  return context
}

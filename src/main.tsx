import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './styles/index.css'
import LocaleProvider from './app/LocaleProvider'
import App from './app/App'
import BrandingProvider from './app/BrandingProvider'
import AuthProvider from './app/AuthProvider'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LocaleProvider>
        <BrandingProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrandingProvider>
      </LocaleProvider>
    </BrowserRouter>
  </StrictMode>,
)

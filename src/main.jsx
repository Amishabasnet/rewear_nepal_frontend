import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { primeCsrfToken } from './services/api.js'

// Fire-and-forget: makes sure the XSRF-TOKEN cookie is set before the
// user's first form submit, so even a first-visit login/register works.
primeCsrfToken()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
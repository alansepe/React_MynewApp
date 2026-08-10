import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AS from './accounting-system.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AS />
  </StrictMode>,
)

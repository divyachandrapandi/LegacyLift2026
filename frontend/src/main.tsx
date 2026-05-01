import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * Frontend bootstrap entrypoint.
 *
 * Description:
 * - Mounts the React application into the DOM root with `StrictMode`.
 * - Exists to initialize the page-level `App` component in browser runtime.
 *
 * Example input:
 * - DOM contains `<div id="root"></div>`.
 *
 * Example output:
 * - React app rendered into `#root`.
 *
 * Usage in project:
 * - Executed by Vite as the default frontend entry file.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

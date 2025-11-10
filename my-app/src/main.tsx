import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/ay.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import HomeListPage from './pages/HomeListPage'
import MonthDetailPage from './pages/MonthDetailPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'months', element: <HomeListPage /> },
      { path: 'month/:id', element: <MonthDetailPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  //<StrictMode>
  <RouterProvider router={router} />
  //</StrictMode>,
)

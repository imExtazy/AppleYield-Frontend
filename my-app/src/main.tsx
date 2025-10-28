import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/ay.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomeListPage from './pages/HomeListPage'
import MonthDetailPage from './pages/MonthDetailPage'
import CalculationPage from './pages/CalculationPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomeListPage /> },
      { path: 'month/:id', element: <MonthDetailPage /> },
      { path: 'months_calculation/:id', element: <CalculationPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

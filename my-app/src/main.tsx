//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/ay.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import HomeListPage from './pages/HomeListPage'
import MonthDetailPage from './pages/MonthDetailPage'
import CalculationPage from './pages/CalculationPage'
import OrdersListPage from './pages/OrdersListPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import { Provider } from 'react-redux'
import { store } from './store'
// Register SW only in production build
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/AppleYield-Frontend/sw.js').catch(() => {});
}

const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'months', element: <HomeListPage /> },
      { path: 'month/:id', element: <MonthDetailPage /> },
      { path: 'months_calculation/:id', element: <CalculationPage /> },
      { path: 'months_calculations', element: <OrdersListPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
]

const router = createBrowserRouter(routes, { basename: '/AppleYield-Frontend' })

createRoot(document.getElementById('root')!).render(
  //<StrictMode>
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
  //</StrictMode>,
)

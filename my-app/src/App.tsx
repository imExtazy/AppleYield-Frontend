import { Outlet } from 'react-router-dom'
import { AppNavbar } from './components/AppNavbar'

export default function App() {
  return (
    <>
      <AppNavbar />
      <main className="ay-container">
        <Outlet />
      </main>
    </>
  )
}

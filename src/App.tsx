import { useAnchor } from '@nice1/react-tools'

import Login from './routes/Login'
import Dashboard from './routes/Dashboard'
import { Route, Routes } from 'react-router-dom'
import Nfts from './routes/NFTS'
import DashboardLayout from './dashboard/DashboardLayout'

export const App = () => {
  const { session } = useAnchor()

  if (session === null) {
    return <Login />
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='/nfts' element={<Nfts />} />
      </Routes>
    </DashboardLayout>
  )
}

import { useAnchor } from '@nice1/react-tools'

import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { Route, Routes } from 'react-router-dom'
import Nfts from './routes/nfts'
import DashboardLayout from './components/DashboardLayout'

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

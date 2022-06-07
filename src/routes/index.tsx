import { useAnchor } from '@nice1/react-tools'
import { Route, Routes } from 'react-router-dom'

import DashboardLayout from '../dashboard/DashboardLayout'
import Login from './Login'
import Dashboard from './Dashboard'
import Nfts from './NFTS'
import Post from './Post'

const AppRoutes = () => {
  const { session } = useAnchor()

  if (session === null) {
    return <Login />
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='/nfts' element={<Nfts />} />
        <Route path='/blog/:slug' element={<Post />} />
      </Routes>
    </DashboardLayout>
  )
}

export default AppRoutes

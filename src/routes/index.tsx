import { useAnchor } from '@nice1/react-tools'
import { Route, Routes } from 'react-router-dom'

import DashboardLayout from '../dashboard/DashboardLayout'
import Login from './Login'
import Dashboard from './Dashboard'
import Nfts from './NFTS'
import Post from './Post'
import BlogLayout from '../dashboard/BlogLayout'

const AppRoutes = () => {
  const { session } = useAnchor()

  if (session === null) {
    return <Login />
  }

  return (
    <>
        <Routes>
          <Route path='/' element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path='/nfts' element={<DashboardLayout><Nfts /></DashboardLayout>} />
          <Route path='/blog/:slug' element={<BlogLayout><Post /></BlogLayout>} />
        </Routes>
    </>

  )
}

export default AppRoutes

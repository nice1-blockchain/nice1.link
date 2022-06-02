import { useAnchor } from '@nice1/react-tools'
import { Route, Routes } from 'react-router-dom'

import DashboardLayout from './dashboard/DashboardLayout'
import Login from './routes/Login'
import Dashboard from './routes/Dashboard'
import Nfts from './routes/NFTS'
import Post from './routes/Post'

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
        <Route path='/blog/:slug' element={<Post />} />
      </Routes>
    </DashboardLayout>
  )
}

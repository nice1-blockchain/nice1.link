import { useAnchor } from '@nice1/react-tools'
import { Route, Routes } from 'react-router-dom'

import DashboardLayout from '../dashboard/DashboardLayout'
import Login from './Login'
import Dashboard from './Dashboard'
import NftCard from '../nfts/nftSimpleAssets/NftCard'
import Post from './Post'
import BlogLayout from '../dashboard/BlogLayout'
import NftCardSimpleMarket from '../nfts/nftSimpleMarket/NftCardSimpleMarket'
import NftCardAtomicAssets from '../nfts/nftAtomicAssets/NftCardAtomicAssets'

const AppRoutes = () => {
  const { session } = useAnchor()

  if (session === null) {
    return <Login />
  }

  return (
    <>
      <Routes>
        <Route path='/' element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path='/simple-asset' element={<DashboardLayout><NftCard /></DashboardLayout>} />
        <Route path='/simple-market' element={<DashboardLayout><NftCardSimpleMarket /></DashboardLayout>} />
        <Route path='/atomic-asset' element={<DashboardLayout><NftCardAtomicAssets /></DashboardLayout>} />
        {/* <Route path='/market-atomic-asset' element={<DashboardLayout><NftCardSimpleMarket /></DashboardLayout>} /> */}
        <Route path='/blog/:slug' element={<BlogLayout><Post /></BlogLayout>} />
      </Routes>
    </>

  )
}

export default AppRoutes

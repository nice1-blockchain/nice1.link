import { useAnchor } from '@nice1/react-tools'
import { Route, Routes } from 'react-router-dom'

import DashboardLayout from '../dashboard/DashboardLayout'
import Login from './Login'
import Dashboard from './Dashboard'
import NftCard from '../nfts/nftSimpleAssets/NftCardSimpleAssets'
import Post from './Post'
import BlogLayout from '../dashboard/BlogLayout'
import NftCardSimpleMarket from '../nfts/nftSimpleMarket/NftCardSimpleMarket'
import CreatorShell from "../pages/creator/CreatorShell";
import CreatorHome  from "../pages/creator/CreatorHome";
import CreatorPage  from "../pages/creator/CreatorPage";
import StockPage    from "../pages/creator/StockPage";
import ModifyPage   from "../pages/creator/ModifyPage";
import SalesPage    from "../pages/creator/SalesPage";
import RentalsPage  from "../pages/creator/RentalsPage";
//import NftCardAtomicAssets from '../nfts/nftAtomicAssets/NftCardAtomicAssets'
//import NftCardAtomicMarket from '../nfts/nftAtomicMarket/NftCardAtomicMarket'

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
        {/* <Route path='/atomic-asset' element={<DashboardLayout><NftCardAtomicAssets /></DashboardLayout>} />
        <Route path='/atomic-market' element={<DashboardLayout><NftCardAtomicMarket /></DashboardLayout>} /> */}
        <Route path='/blog/:slug' element={<BlogLayout><Post /></BlogLayout>} />
        <Route path="/creator" element={<CreatorShell />}>
          <Route index element={<CreatorHome />} />
          <Route path="create" element={<CreatorPage />} />
          <Route path="stock" element={<StockPage />} />
          <Route path="modify" element={<ModifyPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="rentals" element={<RentalsPage />} />
        </Route>
      </Routes>
    </>

  )
}

export default AppRoutes

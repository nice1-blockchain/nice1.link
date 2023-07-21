import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useAnchor } from '@nice1/react-tools'

export interface NftBaseSimpleMarket {
  id: number | null
  owner: string | null
  author: string | null
  category: string | null
  price: number | null
  offerprice: number | null
  offertime: number | null
  RamPayer: string | null
}


export interface NftSimpleMarket {
  nfts: NftBaseSimpleMarket[]
  updateNfts: () => any
}

export const NftSimpleMarketContext = createContext<NftSimpleMarket>({
  nfts: [],
  updateNfts: () => { },
})


export const useNftSimpleMarket = () => {
  const contxt = useContext(NftSimpleMarketContext)
  if (contxt === null) {
    throw new Error('useNftSimpleMarket() can only be used on children of ....')
  }
  return contxt

}


export const NftSimpleMarketProvider = ({ children }: { children: ReactNode }) => {
  const {session} = useAnchor()
  const [nfts, setNfts] = useState<NftBaseSimpleMarket[]>([])
  const [nftsInit, setNftsInit] = useState<boolean>(false)



  const updateNfts = () => {
    setNftsInit(false)
  }


  // get NFTs SIMPLE_MARKET
  useEffect(() => {
    ; (async () => {
      if (nftsInit || session === null) {
        return
      }

      const { rows } = await session.client.v1.chain.get_table_rows({
        json: true,
        code: 'simplemarket',
        table: 'sells',
        scope: 'simplemarket',
        //index_position: 'fifth',
        //lower_bound: 'name":"GRYON - LegendaryLegends',
        //upper_bound: '{"name":"GRYON - LegendaryLegends"}',
        //lower_bound: session.auth.actor,
        //upper_bound: session.auth.actor,
        limit: 1000,
        reverse: false,
        show_payer: false,
      })
      const nft_rows = rows

      if (!nft_rows) {
        return
      }

      setNfts(nft_rows)
      setNftsInit(true)

    })()
  }, [session, nftsInit]) //


  // logout
  useEffect(() => {
    if (nftsInit && session === null) {
      setNfts([])
      setNftsInit(false)

    }
  }, [session, nftsInit])



  return (
    <NftSimpleMarketContext.Provider value={{ nfts, updateNfts }}>
      {children}
    </NftSimpleMarketContext.Provider>
  )
}


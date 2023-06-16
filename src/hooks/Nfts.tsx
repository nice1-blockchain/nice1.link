import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useAnchor } from '@nice1/react-tools'


export interface NftBase {
  id: number | null
  owner: string | null
  author: string | null
  category: string | null
  idata: string | null
  mdata: string | null}


export interface Nft {
  nfts: NftBase[]
  updateNfts: () => any
}


export const NftContext = createContext<Nft>({
  nfts: [],
  updateNfts: () => { },
})


export const useNft = () => {
  const contxt = useContext(NftContext)
  if (contxt === null) {
    throw new Error('useNft() can only be used on children of <NftsProvider />')
  }
  return contxt
}


export const NftsProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useAnchor()
  const [nfts, setNfts] = useState<NftBase[]>([])
  const [nftsInit, setNftsInit] = useState<boolean>(false)


  const updateNfts = () => {
    setNftsInit(false)
  }

  
  // get NFTs SimpleAssets
  useEffect(() => {
    ; (async () => {
      if (nftsInit || session === null) {
        return
      }

      const { rows } = await session.client.v1.chain.get_table_rows({
        json: true,
        code: 'simpleassets',
        table: 'sassets',
        scope: session.auth.actor,
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
  }, [session, nftsInit]) // session, nfts




  return (
    <NftContext.Provider value={{ nfts, updateNfts }}>
      {children}
    </NftContext.Provider>
  )
}


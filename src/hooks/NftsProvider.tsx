import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useAnchor } from '@nice1/react-tools'


export interface NftBase {
    id: number | null
    owner: string | null
    author: string | null
    category: string | null
    idata: string | null
}


export interface NftSimpleAssets {
    nfts: NftBase[]
}


export const NftSimpleAssetsContext = createContext<NftSimpleAssets>({
    nfts: [],
})


export const useNftSimpleAssets = () => {
    const contxt = useContext(NftSimpleAssetsContext)

    if (contxt === null) {
        throw new Error('useNftSimpleAssets() can only be used on children of <Nice1Provider />')
    }

    return contxt
}


export const SimpleAssetsNFTsProvider = ({ children }: { children: ReactNode }) => {
    const [nfts, setNfts] = useState<NftBase[]>([])
    const { session } = useAnchor()


    // get NFTs SimpleAssets
    useEffect(() => {
        ; (async () => {
            if (session === null) {
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

                limit: 10,
                reverse: false,
                show_payer: false,
            })

            const nft_rows = rows

            if (!nft_rows) {
                return
            }

            setNfts(nft_rows)

        })()

    }, [session])

    return (
        <NftSimpleAssetsContext.Provider value={{ nfts }}>
            {children}
        </NftSimpleAssetsContext.Provider>
    )
}
import { useEffect, useState } from 'react'
import { useAnchor } from '@nice1/react-tools'
import { useNftSimpleMarket } from '../../hooks/NftSimpleMarket'
import { NftBuyConfModal } from './NftBuyConfModalSM'
import ProfileCard from '../../profile/ProfileCard'
import BalanceCard from '../../profile/BalanceCard'
import {
  Grid,
  GridItem,
  Box,
  Text,
  HStack,
  Image,
} from '@chakra-ui/react'


export interface NftBaseSimpleAssetsSimpleMarket {
  id: number | null
  owner: string | null
  author: string | null
  category: string | null
  idata: string | null
  mdata: string | null
}

export interface SimpleAssetsSimpleMarket {
  nftsSASM: NftBaseSimpleAssetsSimpleMarket[]
  updateNfts: () => any
}



const NftCardSimpleMarket = () => {

  const { session } = useAnchor()
  const { nftsSM } = useNftSimpleMarket()
  const [nftsSASM, setNftsSASM] = useState<NftBaseSimpleAssetsSimpleMarket[]>([])
  const [nftsInit, setNftsInit] = useState<boolean>(false)


  // Update NFTs after any actions
  const updateNfts = () => {
    setNftsInit(false)
  }


  // get NFTs SimpleAssets of simplemarket
  useEffect(() => {
    ; (async () => {
      if (nftsInit || session === null) {
        return
      }

      const { rows } = await session.client.v1.chain.get_table_rows({
        json: true,
        code: 'simpleassets',
        table: 'sassets',
        scope: 'simplemarket',
        limit: 1000,
        reverse: false,
        show_payer: false,
      })
      const nft_rows = rows

      if (!nft_rows) {
        return
      }

      setNftsSASM(nft_rows)
      setNftsInit(true)

    })()
  }, [session, nftsInit]) //


  const getImgField = (idata, mdata) => {
    try {
      const cadIdata = idata
      const cadMdata = mdata
      const objectIdata = JSON.parse(cadIdata);
      const objectMdata = JSON.parse(cadMdata);
      const imgIdata = objectIdata.img;
      const imgMdata = objectMdata.img;
      const urlCloudFlare = 'https://cloudflare-ipfs.com/ipfs/'
      const isUrlIdata = idata.includes('https://');
      const isUrlMdata = mdata.includes('https://');

      if (imgIdata && isUrlIdata) {
        return imgIdata
      } else if (imgIdata) {
        return `${urlCloudFlare}${imgIdata}`
      } else if (imgMdata && isUrlMdata) {
        return imgMdata
      } else if (imgMdata) {
        return `${urlCloudFlare}${imgMdata}`      }
    } catch (error) {
      return `${error}`
    }
  }


  const searchMatchesInSA = (id: number | null) => {
    const MatchesSASM = nftsSASM.find(listNftsSASM => listNftsSASM.id === id);
    let urlTemp = ''

    if (MatchesSASM) {
      urlTemp = getImgField(MatchesSASM.idata, MatchesSASM.mdata)
    } else
      urlTemp = 'URL No Found...'

    return urlTemp
  }



  return (
    <>
      <HStack ml={-6} mt={-5} bg='bgs.widgets' justifyContent="flex-end">
        <Box >
          <BalanceCard />
        </Box>
        <Box >
          <ProfileCard />
        </Box>
      </HStack>

      <Grid mt={5} gap={2} templateColumns='repeat(6, 1fr)' templateRows='repeat(1, 1fr)' >
        {
          nftsSM.map((nft, k) => (
            <GridItem key={k} className="custom-grid-item" bg='bgs.widgets' colSpan={1} rowSpan={1} mt={1} p={1} >
              <Box ml={5}>
                <Image m={2} borderRadius={'30px'} objectFit={'cover'} src={searchMatchesInSA(nft.id)} />
              </Box>
              <Box ml={5}>
                <Text color='gray.400'>- Id: {nft.id}</Text>
              </Box>
              <Box ml={5}>
                <Text color='gray.400'>- Author: {nft.author}</Text>
              </Box>
              <Box ml={5}>
                <Text color='gray.400'>- Owner: {nft.owner}</Text>
              </Box>
              <Box ml={5}>
                <Text color='gray.400'>- Price: {nft.price}</Text>
              </Box>
              <Box >
                <NftBuyConfModal asset={nft} />
              </Box>
            </GridItem>
          ))
        }
      </Grid>
    </>
  )
}

export default NftCardSimpleMarket

import { useState } from 'react'
import { useNftSimpleAssets } from '../hooks/NftsProvider'
import NftTransferModal from './NftTransferModal'
import NftDelegateModal from './NftDelegateModal'

import {
  Grid,
  GridItem,
  Box,
  Text,
  HStack,
  AspectRatio
} from '@chakra-ui/react'



const NftCard = () => {
  const { nfts } = useNftSimpleAssets()
  const [indexSelected, setIndexSelected] = useState(null);


  /***
   * Updates the state of indexSelected with the Grid index
   */
  const selectedIndex = (index: any) =>{
    setIndexSelected(index);
  }

  return (
    <>

      <Grid gap={2} mt={10} templateColumns='repeat(6, 1fr)' templateRows='repeat(1, 1fr)' >
          {
            nfts.map((nft, k) => (
              <GridItem key={k} onClick={() => selectedIndex(k)} colSpan={1} rowSpan={1} w='100%' h='100%' bg='bgs.widgets'>
                {/* <AspectRatio maxW='560px' ratio={1}>
                  <iframe
                    title='NICE1 Genesis Key'
                    src='https://images.weserv.nl/?url=https://cloudflare-ipfs.com/ipfs/QmPiiSV4XadLTYHch82g4ED1dbYynuh71WogWkT4DEbA12&h=271'
                    allowFullScreen
                  />
                </AspectRatio> */}
                {/* <AspectRatio maxW='560px' ratio={1}>
                  <iframe
                    title='NICE1 Genesis Key'
                    src='ttps://cloudflare-ipfs.com/ipfs/QmPiiSV4XadLTYHch82g4ED1dbYynuh71WogWkT4DEbA12&h'
                    allowFullScreen
                  />
                </AspectRatio> */}
                
                <Box p='1'>
                  {/* <Text fontSize='sm' color='gray.400'>Index Grid: {indexSelected}</Text> */}
                  {/* <Text fontSize='sm' >Id: {nft.id}</Text> */}
                  <Text fontSize='xs' >idata: {nft.idata}</Text>
                  {/* <Text fontSize='xs' color='gray.400'>mdata: {nft.mdata}</Text> */}
                  <Text fontSize='xs' color='gray.400'> Author: {nft.author}</Text>
                  <Text fontSize='xs' color='gray.400'>Category: {nft.category}</Text>
                </Box>
                <HStack>
                  <Box>
                    <NftTransferModal asset={nft} />
                  </Box>
                  <Box>
                    <NftDelegateModal asset={nft} />
                  </Box>
                </HStack>
              </GridItem>
            ))
          }
        </Grid>
    </>
  )
}

export default NftCard

import React, { useState } from 'react'
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
  function selectedIndex(index: any) {
    setIndexSelected(index);
  }

  return (
    <>
      <Grid gap={5} templateRows='repeat(1, 1fr)' templateColumns='repeat(6, 1fr)' mt={2} >
          {
            nfts.map((nft, k) => (
              <GridItem key={k} onClick={() => selectedIndex(k)} colSpan={1} rowSpan={1} w='100%' h='100%' bg='bgs.widgets' p='2'>
                <AspectRatio maxW='560px' ratio={1}>
                  <iframe
                    title='NICE1 Genesis Key'
                    src='https://images.weserv.nl/?url=https://cloudflare-ipfs.com/ipfs/QmPiiSV4XadLTYHch82g4ED1dbYynuh71WogWkT4DEbA12&h=271'
                    allowFullScreen
                  />
                </AspectRatio>
                <Box p='1'>
                  <Text fontSize='sm' color='gray.400'>{nft.idata}</Text>
                </Box>
                <Box p='1'>
                  <Text  fontSize='sm' color='gray.400'>Asset Id: {nft.id}</Text>
                </Box>
                {/* Displays the value of the Grid Index.... REMOVE
                <Box p='1'>
                  <Text fontSize='sm' color='gray.400'> Valor: { indexSelected }</Text>
                </Box>*/}

                <Box p='1'>
                  <Text fontSize='sm' color='gray.400'> Author: { nft.author }</Text>
                </Box>
                <Box p='1'>
                  <Text fontSize='sm' color='gray.400'>Category: { nft.category }</Text>
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

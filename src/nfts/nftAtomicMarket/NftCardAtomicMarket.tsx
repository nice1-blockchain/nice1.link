import { useState } from 'react'
import { useAnchor } from '@nice1/react-tools'
import { useNftAtomicMarket } from '../../hooks/NftAtomicMarket'
import { NftBuyConfModalAM  } from '../nftAtomicMarket/NftBuyConfModalAM'
import ProfileCard from '../../profile/ProfileCard'
import BalanceCard from '../../profile/BalanceCard'

import {
  Grid,
  GridItem,
  Box,
  Text,
  HStack,
  Image,
  VStack,
  Button,
} from '@chakra-ui/react'



const NftCardAtomicMarket = () => {

  const { nftsAM } = useNftAtomicMarket()
  const { session } = useAnchor()



  return (

    <>
      <HStack ml={-6} mt={-5} bg='bgs.widgets' justifyContent="flex-end">
        <Box ml={5}>
          <Text fontSize='2xl' color='gray.400'>ATOMIC MARKET ----</Text>
        </Box>
        <Box >
          <BalanceCard />
        </Box>
        <Box >
          <ProfileCard />
        </Box>
      </HStack>


      <Grid mt={5} gap={2} templateColumns='repeat(6, 1fr)' templateRows='repeat(1, 1fr)' >
        {
          nftsAM.map((nft, k) => (
            <GridItem key={k} className="custom-grid-item" bg='bgs.widgets' colSpan={1} rowSpan={1} mt={1} p={1} >
              <VStack alignItems='left'>
                {/* <Box ml={5}>
                  <Image m={2}
                    borderRadius={'30px'}
                    objectFit={'cover'}
                    src={searchMatchesInTempAAImag(nft.collection_name, nft.template_id)} />
                </Box>
                <Box ml={5}>
                  <Text fontSize='lg' color='gray.300'><strong>Name: {searchMatchesInTempAAName(nft.collection_name, nft.schema_name, nft.template_id)}</strong></Text>
                </Box> */}
                <Box ml={5}>
                  <Text fontSize='md' color='gray.400'>Sale_id: {nft.sale_id}</Text>
                </Box>
                <Box ml={5}>
                  <Text fontSize='xl' color='gray.400'>Price: {nft.listing_price}</Text>
                </Box>
                <Box ml={5}>
                  <Text fontSize='xl' color='gray.400'>Collection: {nft.collection_name}</Text>
                </Box>
              </VStack>
              <Box >
                <Button>Buy</Button>
              </Box>
            </GridItem>
          ))
        }
      </Grid>
    </>
  )



}

export default NftCardAtomicMarket

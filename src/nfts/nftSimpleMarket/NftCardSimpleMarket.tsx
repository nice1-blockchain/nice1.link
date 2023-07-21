import React from 'react'
import { useNftSimpleMarket } from '../../hooks/NftSimpleMarket'
import {
  Grid,
  GridItem,
  Box,
  Text,

} from '@chakra-ui/react'



const NftCardSimpleMarket = () => {
  const { nfts } = useNftSimpleMarket()

  return (
    <>

      <Grid mt={5} gap={2} templateColumns='repeat(6, 1fr)' templateRows='repeat(1, 1fr)' >
        {
          nfts.map((nft, k) => (
            <GridItem key={k} className="custom-grid-item" bg='bgs.widgets' colSpan={1} rowSpan={1} mt={1} p={1} >
              <Box ml={5}>
                <Text color='gray.400'>Id: {nft.id}</Text>
              </Box>
              <Box ml={5}>
                <Text color='gray.400'>owner: {nft.owner}</Text>
              </Box>
              <Box ml={5}>
                <Text color='gray.400'>author: {nft.author}</Text>
              </Box>
              <Box ml={5}>
                <Text color='gray.400'>category: {nft.category}</Text>
              </Box>
              <Box ml={5}>
                <Text color='gray.400'>price: {nft.price}</Text>
              </Box>
              <Box ml={5}>
                <Text color='gray.400'>offerprice: {nft.offerprice}</Text>
              </Box>
              <Box ml={5}>
                <Text color='gray.400'>offertime{nft.offertime}</Text>
              </Box>
            </GridItem>
          ))
        }
      </Grid>
    </>
  )
}

export default NftCardSimpleMarket

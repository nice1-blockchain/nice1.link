import { useNftSimpleMarket } from '../../hooks/NftSimpleMarket'
import {
  Box,
  Grid,
  GridItem,
  Text
} from '@chakra-ui/react'
import { NftBuyConfModal } from './NftBuyConfModal'



const NftCardSimpleMarket = () => {

  const { nfts } = useNftSimpleMarket()


  return (
    <>
      <Grid mt={5} gap={2} templateColumns='repeat(6, 1fr)' templateRows='repeat(1, 1fr)' >
        {
          nfts.map((nft, k) => (
            <GridItem key={k} className="custom-grid-item" bg='bgs.widgets' colSpan={1} rowSpan={1} mt={1} p={1} >
              {/* <Box ml={5}>
                <Text color='gray.400'>- IMAG </Text>
              </Box>
              <Box ml={5}>
                <Text color='gray.400'>- Nfts/Disp </Text>
              </Box>
              <Box ml={5}>
                <Text color='gray.400'>- Name: SA/sassets/idata/... </Text>
              </Box> */}
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

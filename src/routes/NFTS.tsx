import { useNftSimpleAssets } from '../hooks/NftsProvider'
import TransferNTF from '../components/modals/TransferNTF'
import DelegateNTF from '../components/modals/DelegateNFT'

import { Grid, GridItem, Box, Text, HStack } from '@chakra-ui/react'


export default function Nfts() {
  const { nfts } = useNftSimpleAssets()

  return (
    <>
        <Grid gap={5} templateRows='repeat(1, 1fr)' templateColumns='repeat(6, 1fr)' mt={2}>
          {
            nfts.map((nft, k) => (
              <GridItem key={k} colSpan={1} rowSpan={1} w='100%' h='100%' bg='bgs.widgets' p='2'>
                <Box p='1'>
                  <Text >[-----IMAGEN NFT_X-----]</Text>
                </Box>
                <Box p='1'>
                  <Text fontWeight='bold' fontSize='sm' color='gray.400'>{nft.id}</Text>
                </Box>
                <Box p='1'>
                  <Text fontWeight='bold' fontSize='sm' color='gray.400'>{nft.idata}</Text>
                </Box>
                <Box p='1'>
                  <Text fontSize='sm' color='gray.400'> Author: {nft.author}</Text>
                </Box>
                <Box p='1'>
                  <Text fontSize='sm' color='gray.400'>Category: {nft.category}</Text>
                </Box>
                <HStack>
                  <Box>
                    <TransferNTF />
                  </Box>
                  <Box>
                    <DelegateNTF />
                  </Box>
                </HStack>
              </GridItem>
            ))
          }
        </Grid>
    </>
  )
}

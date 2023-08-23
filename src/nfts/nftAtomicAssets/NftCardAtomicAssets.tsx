import { useNftAtomicAssets } from '../../hooks/NftAtomicAssets'
import ProfileCard from '../../profile/ProfileCard'
import BalanceCard from '../../profile/BalanceCard'
// import NftTransferModal from './NftTransferModal'
// import NftDelegateModal from './NftDelegateModal'
import { MdPerson, MdCollections } from 'react-icons/md'
import {
  Grid,
  GridItem,
  Box,
  Text,
  HStack,
  Icon,
  VStack,
} from '@chakra-ui/react'




const NftCardAtomicAssets = () => {
  const { nftsAA } = useNftAtomicAssets()


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
          nftsAA.map((nft, k) => (
            <GridItem key={k} className="custom-grid-item" bg='bgs.widgets' colSpan={1} rowSpan={1} mt={1} p={1} >
              <VStack alignItems='left'>
                <Box ml={5}>
                  <Text fontSize='xs' color='gray.400'>{nft.asset_id}</Text>
                </Box>
                <Box ml={5}>
                  <Text fontSize='xs' color='gray.400'>{nft.collection_name}</Text>
                </Box>
              </VStack>
            </GridItem>
          ))
        }
      </Grid>
    </>
  )

}

export default NftCardAtomicAssets

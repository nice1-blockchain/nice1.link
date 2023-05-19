import { useState, useEffect } from 'react'
//import { useAnchor } from '@nice1/react-tools'
import { useNftSimpleAssets } from '../hooks/NftsProvider'
import NftTransferModal from './NftTransferModal'
import NftDelegateModal from './NftDelegateModal'
import {
  Grid,
  GridItem,
  Box,
  Text,
  HStack,
  AspectRatio,
  Input,
  Button
} from '@chakra-ui/react'



const NftCard = () => {
  //const { session } = useAnchor()
  const { nfts } = useNftSimpleAssets()
  const [indexSelected, setIndexSelected] = useState(null);


  const cleanFields = (cad) => {
    try {
      const cadena = cad
      const objetoIdata = JSON.parse(cadena);
      const name = objetoIdata.name;
      return name
    } catch (error) {
      console.log('Error:', error);
      return 'Incorrect name !!!'
    }
  }


  /***
   * Updates the state of indexSelected with the Grid index
   */
  const selectedIndex = (index: any) =>{
    setIndexSelected(index);
  }


  return (
    <>
      <Grid gap={1} mt={4} templateColumns='repeat(6, 1fr)' templateRows='repeat(1, 1fr)' padding={'10px'}>
          {
            nfts.map((nft, k) => (
              <GridItem key={k} onClick={() => selectedIndex(k)} colSpan={1} rowSpan={1} w='100%' h='100%' bg='bgs.widgets'>
                <AspectRatio maxW='560px' ratio={1}>
                  <iframe
                    title='NICE1 Genesis Key'
                    src='https://images.weserv.nl/?url=https://cloudflare-ipfs.com/ipfs/QmPiiSV4XadLTYHch82g4ED1dbYynuh71WogWkT4DEbA12&h=271'
                    allowFullScreen
                  />
                </AspectRatio>
                {/* <AspectRatio maxW='560px' ratio={1}>
                  <iframe
                    title='NICE1 Genesis Key'
                    src='ttps://cloudflare-ipfs.com/ipfs/QmPiiSV4XadLTYHch82g4ED1dbYynuh71WogWkT4DEbA12&h'
                    allowFullScreen
                  />
                </AspectRatio> */}
                <Box p='1' >
                  {/* <Text fontSize='sm' color='gray.400'>Index Grid: {indexSelected}</Text> */}
                  {/* <Text fontSize='sm' >Id: {nft.id}</Text>
                  <Text fontSize='xs' color='gray.400'>En Bruto: {nft.idata} </Text> */}
                  <Text fontSize='md' color='gray.400'><strong>{cleanFields(nft.idata)}</strong> </Text>
                  {/* <Text fontSize='xs' color='gray.400'>mdata: {nft.mdata}</Text> */}
                  <Text fontSize='xs' color='gray.400'>Author: {nft.author}</Text>
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

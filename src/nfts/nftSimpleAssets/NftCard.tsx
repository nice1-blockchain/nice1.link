//import { useState, useEffect } from 'react'
//import { useAnchor } from '@nice1/react-tools'
import { useNftSimpleAssets } from '../../hooks/NftSimpleAssets'
import ProfileCard from '../../profile/ProfileCard'
import BalanceCard from '../../profile/BalanceCard'
import NftTransferModal from './NftTransferModal'
import NftDelegateModal from './NftDelegateModal'
import { MdPerson, MdCollections } from 'react-icons/md'
import {
  Grid,
  GridItem,
  Box,
  Text,
  HStack,
  Icon,
  Image,
  Stack,
  VStack,
} from '@chakra-ui/react'



const NftCard = () => {
  //const { session } = useAnchor()
  const { nftsSA } = useNftSimpleAssets()
  //const [indexSelected, setIndexSelected] = useState(null);

  const cleanFieldName = (cad) => {
    try {
      const cadena = cad
      const objectIdata = JSON.parse(cadena);
      const name = objectIdata.name;
      return name
    } catch (error) {
      console.log('Error:', error);
      return `${error}`
    }
  }

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
      }  else if (imgMdata) {
        return `${urlCloudFlare}${imgMdata}`
      }
    } catch (error) {
      return `${error}`
    }
  }

  /***
   * Updates the state of indexSelected with the Grid index
   */
  // const selectedIndex = (index: any) =>{
  //   setIndexSelected(index);
  // }
  // onClick = {() => selectedIndex(k)}


  return (
    <>
      <HStack ml={-6} mt={-5}  bg='bgs.widgets' justifyContent="flex-end">
        <Box >
          <BalanceCard />
        </Box>
        <Box >
          <ProfileCard />
        </Box>
      </HStack>

      <Grid mt={5} gap={2} templateColumns='repeat(6, 1fr)' templateRows='repeat(1, 1fr)' >
          {
          nftsSA.map((nft, k) => (
              <GridItem key={k} className="custom-grid-item" bg='bgs.widgets' colSpan={1} rowSpan={1}mt={1} p={1} >
                <Stack>
                  <Image m={2} borderRadius={'30px'} objectFit={'cover'} src={getImgField(nft.idata, nft.mdata)} />
                </Stack>
                <VStack alignItems='left'>
                  <Box ml={5} mt={2}>
                    {/* <Text fontSize='sm' color='gray.400'>Index Grid: {indexSelected}</Text> */}
                    <Text fontSize='md'><strong>{cleanFieldName(nft.idata)}</strong> </Text>
                  </Box>
                  <HStack>
                    <Box ml={5}>
                      <Icon as={MdPerson} />
                    </Box>
                    <Box ml={5}>
                      <Text fontSize='xs' color='gray.400'>{nft.author}</Text>
                    </Box>
                  </HStack>
                  <HStack>
                    <Box ml={5}>
                      <Icon as={MdCollections} />
                    </Box>
                    <Box ml={5}>
                      <Text fontSize='xs' color='gray.400'>{nft.category}</Text>
                    </Box>
                  </HStack>
                  <HStack>
                    <Box >
                      <NftTransferModal asset={nft} />
                    </Box>
                    <Box>
                      <NftDelegateModal asset={nft} />
                    </Box>
                  </HStack>
                </VStack>
              </GridItem>
            ))
          }
        </Grid>
    </>
  )
}



export default NftCard

import React, { useRef, useState } from 'react'
import { useNftSimpleAssets } from '../hooks/NftsProvider'
import NftModalTransfer from './NftModalTransfer'
import DelegateNTF from './NftModalDelegate'

import {
  Grid,
  GridItem,
  Box,
  Text,
  HStack,
  useDisclosure,
  Button,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input
} from '@chakra-ui/react'



const Nfts = () => {
  const { nfts } = useNftSimpleAssets()
  const { isOpen, onOpen, onClose } = useDisclosure()
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

                <Box p='1'>
                  <Text >[-----IMAGEN NFT_X-----]</Text>
                </Box>
                <Box p='1'>
                  <Text  fontWeight='bold' fontSize='sm' color='gray.400'>{nft.id}</Text>


                </Box>
                <Input readOnly value={k}></Input>
                <Box p='1'>
                  <Text fontSize='sm' color='gray.400'> Valor: { indexSelected }</Text>
                </Box>


                <Box p='1'>
                  <Text fontWeight='bold' fontSize='sm' color='gray.400'>{ nft.idata }</Text>
                </Box>
                <Box p='1'>
                  <Text fontSize='sm' color='gray.400'> Author: { nft.author }</Text>
                </Box>
                <Box p='1'>
                  <Text fontSize='sm' color='gray.400'>Category: { nft.category }</Text>
                </Box>
                <HStack>
                  <Box>
                    <NftModalTransfer asset={nft} />
                  </Box>
                  <Box>
                    <DelegateNTF asset={nft} />
                  </Box>
                </HStack>
              </GridItem>
            ))
          }
        </Grid>
    </>
  )
}

export default Nfts

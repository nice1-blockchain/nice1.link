import React from 'react'
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


import { Edit } from '../icons'
import styled from 'styled-components'

const SVGIconButton: typeof IconButton = styled(IconButton)`
  svg {
    width: 100%;
    height: 100%;
  }
`



const Nfts = () => {
  const { nfts } = useNftSimpleAssets()
  const { isOpen, onOpen, onClose } = useDisclosure()

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
                  <Text fontWeight='bold' fontSize='sm' color='gray.400'>{ nft.id }</Text>
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
                    <Button onClick={onOpen}>Tranfer</Button>
                    <NftModalTransfer isOpen={isOpen} onClose={onClose} />
                  </Box>
                  {/*<SVGIconButton
                    variant='link'
                    aria-label='edit profile'
                    icon={<Edit />}
                    ml={4}
                    size='xs'
                    height='15px'
                    onClick={onOpen}
                  />*/}
                  <Box>
                    <DelegateNTF/>
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

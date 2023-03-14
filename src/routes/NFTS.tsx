import { useNftSimpleAssets } from "../hooks/NftsProvider"
import {
  Grid,
  GridItem,
  Button,  
  Box,
  Text,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  ChakraProvider,
  FormControl,
  FormLabel,
  Input

} from '@chakra-ui/react'



function TranferNTF() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>      
      <Box p={4}>
        <Button onClick={onOpen}>Transfer...</Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Transfer NFT asset</ModalHeader> 
            <ModalCloseButton />
            <ModalBody>              
              <FormControl mt={4}>
                <FormLabel>Recipient account name:</FormLabel>
                <Input placeholder='Account name...' />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>MEMO (optional)</FormLabel>
                <Input placeholder='MEMO...' />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme={"red"} mr={3} onClick={onClose}>Tranfer</Button>               
              <Button colorScheme={"red"} mr={3} onClick={onClose}>Close</Button>              
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>      
    </>
  )
}


function DelegateNTF() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Box p={4}>
        <Button onClick={onOpen}>Delegate...</Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delegate NFT asset</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl mt={4}>
                <FormLabel>Recipient account name:</FormLabel>
                <Input placeholder='Account name...' />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>MEMO (optional)</FormLabel>
                <Input placeholder='MEMO...' />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Delegate time:</FormLabel>
                <Input placeholder='Time...' />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme={"red"} mr={3} onClick={onClose}>Delegate</Button>
              <Button colorScheme={"red"} mr={3} onClick={onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  )
}



export default function Nfts() {
  const { nfts } = useNftSimpleAssets()

  return (
    <>
      {/*<ChakraProvider>*/}
        <Grid gap={5} templateRows='repeat(1, 1fr)' templateColumns='repeat(6, 1fr)' mt={2}>
          {
            nfts.map((nft, k) => (
              <GridItem key={k} colSpan={1} rowSpan={1} w='100%' h='100%' bg='bgs.widgets' p='2'>
                <Box p='1'>
                  <Text >[-----IMAGEN NFT_X-----]</Text>
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
                    <TranferNTF />
                  </Box>
                  <Box>
                    <DelegateNTF />
                  </Box>
                </HStack>
              </GridItem>
            ))
          }
        </Grid>        
      {/*</ChakraProvider>*/}      
      
    </>
  )
}
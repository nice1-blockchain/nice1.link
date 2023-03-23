import React from 'react';
import {
  Button,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input

} from '@chakra-ui/react'


{/* DEVELOP DELEGATE FUNCTION....*/ }

const DelegateNTF = () => {
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

export default DelegateNTF;


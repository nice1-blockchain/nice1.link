import { useRef, useState } from 'react';
import { useAnchor } from '@nice1/react-tools'
import NftTransferConfirmModal from './NftTransferConfirmModal';

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
  Input,


} from '@chakra-ui/react'



const NftTransferModal = ({ asset }: any) => {
  const { session } = useAnchor()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const inputAssetIdTransferRef = useRef<HTMLInputElement>(null);
  const inputToTransferRef = useRef<HTMLInputElement>(null);
  const inputMemoTransferRef = useRef<HTMLInputElement>(null);


  // Pending validation Ctrol V + Ctrol C
  const handleKeyPress = (event) => {
    const char = event.key;
    if (!(/[a-z0-9]/.test(char))) {
      event.preventDefault();
      alert("Only Lowercase Letters and Numbers !!!")
    }
  }



  return (
    <>
      <Box p={4}>
        <Button onClick={onOpen}>Transfer</Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Assets Transfer</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {/* <FormControl mt={4}>
                <FormLabel>From: </FormLabel>
                <Input readOnly value={session?.auth.actor.toString()} />
              </FormControl>*/}
              <pre>
                <FormControl mt={4}>
                  <FormLabel>Assets Id:
                    <Input border={'0px'} readOnly value={asset.id} ref={inputAssetIdTransferRef} />
                  </FormLabel>
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>To:</FormLabel>
                  <Input
                    type='text'
                    ref={inputToTransferRef}
                    onKeyPress={handleKeyPress}
                    placeholder='Account name...' />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>MEMO (optional)</FormLabel>
                  <Input type='text' ref={inputMemoTransferRef} placeholder='Memo...' />
                </FormControl>
              </pre>
              </ModalBody>
            <ModalFooter>
              <Box>
                <NftTransferConfirmModal
                  transfTo={inputToTransferRef}
                  transfAssetId={inputAssetIdTransferRef}
                  transfMemo={inputMemoTransferRef}
                />
              </Box>
              {/* <Button colorScheme={"red"} mr={3} onClick={onClose}>Cancel</Button> */}
            </ModalFooter>
          </ModalContent>
          </Modal>
      </Box>
    </>
  )
}


export default NftTransferModal;


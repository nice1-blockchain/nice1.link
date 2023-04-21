import { useRef } from 'react';
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



  return (
    <>
      <Box p={4}>
        <Button onClick={onOpen}>Transfer</Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Transfer Asset</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl mt={4}>
                <FormLabel>From: </FormLabel>
                <Input readOnly value={session?.auth.actor.toString()} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Assets ID:</FormLabel>
                <Input readOnly value={asset.id} ref={inputAssetIdTransferRef} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>To:</FormLabel>
                <Input type='text' ref={inputToTransferRef} placeholder='Account name...' />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>MEMO (optional)</FormLabel>
                <Input type='text' ref={inputMemoTransferRef} placeholder='Memo...' />
              </FormControl>
            </ModalBody>
            <ModalFooter>

              <Box>
                <NftTransferConfirmModal
                  transfAssetId={inputAssetIdTransferRef}
                  transfTo={inputToTransferRef}
                  transfMemo={inputMemoTransferRef}
                />
              </Box>
              {/*<Button colorScheme={"red"} mr={3} onClick={submitTransfer}>Tranfer</Button>*/}
              <Button colorScheme={"red"} mr={3} onClick={onClose}>Cancel</Button>

            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  )
}


export default NftTransferModal;


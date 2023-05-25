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
  Text
} from '@chakra-ui/react'



const NftTransferModal = ({ asset }: any) => {
  const { session } = useAnchor()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const inputToTransferRef = useRef<HTMLInputElement>(null);
  const inputMemoTransferRef = useRef<HTMLInputElement>(null);
  const inputMensajeErrorTransferRef = useRef<HTMLInputElement>(null);


  return (
    <>
      <Box margin={4}>
        <Button border={'1px'} onClick={onOpen}>Transfer</Button>
        <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={inputToTransferRef}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontSize='md' textAlign='center'>Asset Transfer</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <pre>
                <Box>
                  {/* <Text>From: {session?.auth.actor.toString()}</Text> */}
                  <Text>Id: {asset.id}</Text>
                </Box>
                <Box>
                  <FormControl mt={4} isRequired>
                    <FormLabel>To:</FormLabel>
                    <Input type="text" ref={inputToTransferRef} placeholder='Account name... (required)' />
                  </FormControl>
                  <FormControl>
                    <Input
                      type='text'
                      border={'0px'}
                      color='tomato'
                      readOnly
                      ref={inputMensajeErrorTransferRef}
                    />
                  </FormControl>
                  <FormControl mt={2} >
                    <FormLabel>MEMO:</FormLabel>
                    <Input type='text' ref={inputMemoTransferRef} placeholder='Memo... (optional)' />
                  </FormControl>
                </Box>
              </pre>
            </ModalBody>
            <ModalFooter>
              <Box>
                <NftTransferConfirmModal
                  transfTo={inputToTransferRef}
                  transfAssetId={asset.id}
                  transfMemo={inputMemoTransferRef}
                  transMesError={inputMensajeErrorTransferRef}
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


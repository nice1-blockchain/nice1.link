import { useRef } from 'react';
import { useAnchor } from '@nice1/react-tools'

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


const NftModalTransfer = ({ asset }: any) => {

  const { session } = useAnchor()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const inputAssetIdTransferRef = useRef<HTMLInputElement>(null);
  const inputToTransferRef = useRef<HTMLInputElement>(null);
  const inputMemoTransferRef = useRef<HTMLInputElement>(null);




  function submitTransfer() {

    if (inputAssetIdTransferRef.current && inputToTransferRef.current && inputMemoTransferRef.current) {
      const valueAssetIdTransfer = inputAssetIdTransferRef.current.value;
      const valueAssetIdTransferFormat = [valueAssetIdTransfer];
      //const valueAssetIdTransferXXX = [100000000000004];

      const valueInputToTransfer = inputToTransferRef.current.value;
      const valueInputMemoTransfer = inputMemoTransferRef.current.value;

      session?.transact({
        action: {
          account: 'simpleassets',
          name: 'transfer',
          authorization: [session.auth],
          data: {
            from: session.auth.actor,
            to: valueInputToTransfer,
            assetids: valueAssetIdTransferFormat,
            memo: valueInputMemoTransfer
          }
        }
      }).then((result) => {
        console.log(result);
        return result;
      })
    }
  }


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
                <Input ref={inputAssetIdTransferRef} readOnly value={asset.id}/>
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
              <Button colorScheme={"red"} mr={3} onClick={submitTransfer}>Tranfer</Button>
              <Button colorScheme={"red"} mr={3} onClick={onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  )
}


export default NftModalTransfer;


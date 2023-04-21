import { useState } from 'react';
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
  Text
} from '@chakra-ui/react'

const NftTransferConfirmModal = ({ transfAssetId, transfTo, transfMemo }: any) => {

  const { session } = useAnchor()
  const { isOpen, onOpen, onClose } = useDisclosure()

  function confirmTransfer() {
    if (transfAssetId.current && transfTo.current && transfMemo.current) {
      const valueAssetIdTransfer = transfAssetId.current.value;
      const valueAssetIdTransferFormat = [valueAssetIdTransfer];
      const valueInputToTransfer = transfTo.current.value;
      const valueInputMemoTransfer = transfMemo.current.value;
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
    // CERRAR Y VOLVER....
  }



  return (
    <>
      <Box p={4}>
        <Button onClick={onOpen}>Submit</Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Confirmar Datos Transfer !!!</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box p='2'>
                <Text fontSize='lg'>Cuenta destino: {transfTo.current?.value} </Text>
              </Box>
              <Box p='2'>
                <Text fontSize='lg'>Info Memo: {transfMemo.current?.value}</Text>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme={"red"} mr={3} onClick={confirmTransfer}>Confirm</Button>
              <Button colorScheme={"red"} mr={3} onClick={onClose}>Reject</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  )
}



export default NftTransferConfirmModal

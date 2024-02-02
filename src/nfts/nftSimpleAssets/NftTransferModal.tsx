import { useRef, useState } from 'react';
import { useNftSimpleAssets } from '../../hooks/NftSimpleAssets'
import NftTransferConfModal from './NftTransferConfModal'
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
  const { updateNfts } = useNftSimpleAssets()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const inputToTransferRef = useRef<HTMLInputElement>(null);
  const inputMemoTransferRef = useRef<HTMLInputElement>(null);
  const inputMensajeErrorTransferRef = useRef<HTMLInputElement>(null);

  const [isOkResultTransaction, setIsOkResultTransaction] = useState(false)
  const [infoTransaction, setInfoTransaction] = useState('')

  const [isOpenModalResulTranSuccess, setIsOpenModalResulTranSuccess] = useState(false);
  const [isOpenModalResulTransError, setIsOpenModalResulTransOpenError] = useState(false);


  const closeModalTransfer = (isOkResTrans, infoTrans) => {
    if (isOkResTrans) {
      onClose()
      setIsOpenModalResulTranSuccess(true)
      setInfoTransaction(infoTrans)
    } else {
      onClose()
      setIsOpenModalResulTransOpenError(true)
    }
  }

  const closePopups = () => {
    setTimeout(updateNfts, 100,);
    setIsOkResultTransaction(false)
    setInfoTransaction('')
    setIsOpenModalResulTranSuccess(false)
    setIsOpenModalResulTransOpenError(false)
  }


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
                <NftTransferConfModal
                  transfTo={inputToTransferRef}
                  transfAssetId={asset.id}
                  transfMemo={inputMemoTransferRef}
                  transMesError={inputMensajeErrorTransferRef}
                  isOkResultTrans={isOkResultTransaction}
                  infoTransaction={infoTransaction}
                  closeModalTransfer={closeModalTransfer}
                />
              </Box>
              {/* <Button colorScheme={"red"} mr={3} onClick={onClose}>Cancel</Button> */}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
      <Box>
        <Modal isOpen={isOpenModalResulTranSuccess} onClose={closePopups}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Transaction result</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box p='1'>
                <Text fontSize='small'>Transaction: {infoTransaction} was successful !!!</Text>
              </Box>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>

      <Box>
        <Modal isOpen={isOpenModalResulTransError} onClose={closePopups}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Transaction result</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box p='1'>
                <Text fontSize='small'>Error processing the transaction. Please try again !!!</Text>
              </Box>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>

    </>
  )
}

export default NftTransferModal;


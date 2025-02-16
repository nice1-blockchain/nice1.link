import { useRef, useState } from 'react';
import { useNftSimpleAssets } from '../../hooks/NftSimpleAssets'
import NftDelegateConfModal from './NftDelegateConfModal';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './StyleTemp.css'; // validate....
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
  Switch,
  Text
} from '@chakra-ui/react'



const NftDelegateModal = ({ asset }: any ) => {
  const { updateNfts } = useNftSimpleAssets()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const inputToDelegRef = useRef<HTMLInputElement>(null);
  const inputEpochLimiteRef = useRef<HTMLInputElement>(null);
  const inputMemoDelegRef = useRef<HTMLInputElement>(null);
  const inputMesErrorDelegRef = useRef<HTMLInputElement>(null);

  const [valueSwitchRedelegate, setValueSwitchRedelegate] = useState(false);
  const [epochLimite, setEpochLimite] = useState(Date.now());

  const [isOkResultTransaction, setIsOkResultTransaction] = useState(false)
  const [infoTransaction, setInfoTransaction] = useState('')

  const [isOpenModalResulTranSuccess, setIsOpenModalResulTranSuccess] = useState(false);
  const [isOpenModalResulTransError, setIsOpenModalResulTransOpenError] = useState(false);


  const handleChangeRedelegate = () => {
    setValueSwitchRedelegate(!valueSwitchRedelegate);
  };

  const cleanInputs = () => {
    setEpochLimite(Date.now())
    onOpen()
  }

  const closeModalDelegation = (resTrans, infoTrans) => {
    if (resTrans) {
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
        <Button border={'1px'} onClick={cleanInputs}>Delegate</Button>
        <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={inputToDelegRef}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontSize='md' textAlign='center'>Assets Delegation</ModalHeader>
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
                    <Input
                      type='text'
                      placeholder='Account name...'
                      ref={inputToDelegRef}
                    />
                  </FormControl>
                  <FormControl>
                    <Input
                      type='text'
                      border={'0px'}
                      color='tomato'
                      readOnly
                      ref={inputMesErrorDelegRef}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel mt={4}>Fecha Limite:</FormLabel>
                    <DatePicker
                      minDate={new Date()}
                      selected={epochLimite}
                      onChange={(date) => setEpochLimite(date)}
                      dateFormat="dd/MM/yyyy"
                      className="custom-picker"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel mt={4}>Epoch Limite:
                      <Input border={'0px'} readOnly value={Math.floor(epochLimite / 1000)} ref={inputEpochLimiteRef} />
                    </FormLabel>
                  </FormControl>
                  <FormControl mt={4}>
                    <FormLabel>Redelegate (Allow redelegate)</FormLabel>
                    <Switch isChecked={valueSwitchRedelegate} onChange={handleChangeRedelegate} />
                  </FormControl>
                  <FormControl mt={4}>
                    <FormLabel>MEMO (optional)</FormLabel>
                    <Input type='text' ref={inputMemoDelegRef} placeholder='Max 64 length....' />
                  </FormControl>
                </Box>
              </pre>
            </ModalBody>
            <ModalFooter>
              <Box>
                <NftDelegateConfModal
                  delegTo={inputToDelegRef}
                  delegAssetId={asset.id}
                  delegEpochLimit={inputEpochLimiteRef}
                  delegRedeleg={valueSwitchRedelegate}
                  delegMemo={inputMemoDelegRef}
                  delMesError={inputMesErrorDelegRef}
                  isOkResultTrans={isOkResultTransaction}
                  closeModalDelegation={closeModalDelegation}
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

export default NftDelegateModal;


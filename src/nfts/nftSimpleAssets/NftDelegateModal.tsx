import { useRef, useState } from 'react';
//import { useAnchor } from '@nice1/react-tools';
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
  //const { session } = useAnchor()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const inputToDelegRef = useRef<HTMLInputElement>(null);
  const inputEpochLimiteRef = useRef<HTMLInputElement>(null);
  const inputMemoDelegRef = useRef<HTMLInputElement>(null);
  const inputMesErrorDelegRef = useRef<HTMLInputElement>(null);

  const [valueSwitchRedelegate, setValueSwitchRedelegate] = useState(false);
  const [epochLimite, setEpochLimite] = useState(Date.now());

  const [resultDelegation, setResultDelegation] = useState(false)

  const closeModalDelegation = (resDeleg) => {
    if (resDeleg) {
      onClose()
    }
  }


  const handleChangeRedelegate = () => {
    setValueSwitchRedelegate(!valueSwitchRedelegate);
  };


  const cleanInputs = () => {
    setEpochLimite(Date.now())
    onOpen()
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
                  resultDelegation={resultDelegation}
                  closeModalDelegation={closeModalDelegation}
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

export default NftDelegateModal;


import { useRef, useState } from 'react';
import { useAnchor } from '@nice1/react-tools';
import NftDelegateConfirmModal from './NftDelegateConfirmModal';

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


} from '@chakra-ui/react'


const NftDelegateModal = ({ asset }: any ) => {
  const { session } = useAnchor()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const inputAssetIdDelegateRef = useRef<HTMLInputElement>(null);
  const inputToDelegateRef = useRef<HTMLInputElement>(null);
  const inputEpochLimiteRef = useRef<HTMLInputElement>(null);
  const inputMemoDelegateRef = useRef<HTMLInputElement>(null);
  //const inputEpochClickNftTabRef = useRef<HTMLInputElement>(null);

  const [valueSwitchRedelegate, setValueSwitchRedelegate] = useState(false);
  const [epochLimite, setEpochLimite] = useState(Date.now());
  //const [epochClickNftTab, setEpochClickNftTab] = useState(Date.now());


  const handleChangeRedelegate = () => {
    setValueSwitchRedelegate(!valueSwitchRedelegate);
  };

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
        <Button onClick={onOpen}>Delegate</Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Assets Delegation</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {/* <FormControl mt={4}>
                <FormLabel>Epoch Click Pestaña NFT:</FormLabel>
                <Input value={Math.floor(epochClickNftTab / 1000)} ref={inputEpochClickNftTabRef} />
              </FormControl> */}
              {/* <FormControl mt={4}>
                <FormLabel>From: </FormLabel>
                <Input readOnly value={session?.auth.actor.toString()} />
              </FormControl>*/}
              <pre>
                <FormControl mt={4}>
                  <FormLabel>Assets Id:
                    <Input border={'0px'} readOnly value={asset.id} ref={inputAssetIdDelegateRef} />
                  </FormLabel>
                </FormControl>
              <FormControl mt={4}>
                <FormLabel>To:</FormLabel>
                <Input type='text' ref={inputToDelegateRef} onKeyPress={handleKeyPress} placeholder='Account name...' />
              </FormControl>
              <FormControl>
                  <FormLabel mt={4}>Fecha Limite :</FormLabel>
                <DatePicker
                  selected={epochLimite}
                  onChange={(date) => setEpochLimite(date)}
                  dateFormat="dd/MM/yyyy"
                  className="custom-picker"
                />
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
                <Input type='text' ref={inputMemoDelegateRef} placeholder='Max 64 length....' />
              </FormControl>
              </pre>
            </ModalBody>
            <ModalFooter>

              <Box>
                <NftDelegateConfirmModal
                  delegTo={inputToDelegateRef}
                  delegAssetId={inputAssetIdDelegateRef}
                  delegEpochLimite={inputEpochLimiteRef}
                  delegRedeleg={valueSwitchRedelegate}
                  delegMemo={inputMemoDelegateRef}
                />
              </Box>
              {/*<Button colorScheme={"red"} mr={3} onClick={submitTransfer}>Tranfer</Button>*/}
              {/* <Button colorScheme={"red"} mr={3} onClick={onClose}>Cancel</Button> */}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  )
}

export default NftDelegateModal;


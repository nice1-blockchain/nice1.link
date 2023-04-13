import { useRef, useState } from 'react';
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
  Switch,
  Checkbox

} from '@chakra-ui/react'


const NftDelegateModal = ({ asset }: any ) => {
  const { session } = useAnchor()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const inputAssetIdDelegateRef = useRef<HTMLInputElement>(null);
  const inputToDelegateRef = useRef<HTMLInputElement>(null);
  const inputTimeDelegateRef = useRef<HTMLInputElement>(null);
  const inputMemoDelegateRef = useRef<HTMLInputElement>(null);
  const [valueSwitchRedelegate, setValueSwitchRedelegate] = useState(false);


  const handleChangeRedelegate = () => {
    setValueSwitchRedelegate(!valueSwitchRedelegate);
  };


  function submitDelegate() {
    if (inputAssetIdDelegateRef.current && inputToDelegateRef.current && inputTimeDelegateRef.current && inputMemoDelegateRef.current) {
        const valueAssetIdDelegate = inputAssetIdDelegateRef.current.value;
        const valueAssetIdDelegateFormat = [valueAssetIdDelegate]; //Format
        const valueToDelegate = inputToDelegateRef.current.value;
        const valueTimeDelegate = inputTimeDelegateRef.current.value;
        const valueTimeDelegateFormat = [valueTimeDelegate]; //Format
        const valueMemoDelegate = inputMemoDelegateRef.current.value;

        session?.transact({
          action: {
            account: 'simpleassets',
            name: 'delegate',
            authorization: [session.auth],
            data: {
              owner: session.auth.actor,
              to: valueToDelegate,
              assetids: valueAssetIdDelegateFormat,
              period: valueTimeDelegateFormat,
              redelegate: valueSwitchRedelegate,
              memo: valueMemoDelegate
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
        <Button onClick={onOpen}>Delegate</Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delegate Asset</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl mt={4}>
                <FormLabel>From: </FormLabel>
                <Input readOnly value={session?.auth.actor.toString()} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Assets ID:</FormLabel>
                <Input ref={inputAssetIdDelegateRef} readOnly value={asset.id} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>To:</FormLabel>
                <Input type='text' ref={inputToDelegateRef} placeholder='Account name...' />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Delegate time:</FormLabel>
                <Input ref={inputTimeDelegateRef} placeholder='Time in seconds...' />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Redelegate (Allow redelegate)</FormLabel>
                <Switch isChecked={valueSwitchRedelegate} onChange={handleChangeRedelegate} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>MEMO (optional)</FormLabel>
                <Input type='text' ref={inputMemoDelegateRef} placeholder='Max 64 length....' />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme={"red"} mr={3} onClick={submitDelegate}>Delegate</Button>
              <Button colorScheme={"red"} mr={3} onClick={onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  )
}

export default NftDelegateModal;


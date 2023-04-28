import { useState, useEffect } from 'react';
import { useAnchor } from '@nice1/react-tools'

//import './StyleTemp.css'; // validate....

import {
  Button,
  Box,
  Code,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,

} from '@chakra-ui/react'


const NftTransferConfirmModal = ({ transfTo, transfAssetId, transfMemo }: any) => {

  const { session } = useAnchor()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [timeLeft, setTimeLeft] = useState(10);
  const [isCountdownActive, setIsCountdownActive] = useState(false);


  useEffect(() => {
    if (isCountdownActive && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (isCountdownActive && timeLeft === 0) {
      //alert('Tiempo Agotado')
      //onClose();
    }
  }, [isCountdownActive, timeLeft, onClose]);


  function handleStartCountdown() {
    setIsCountdownActive(true);
    setTimeLeft(10)
    onOpen()
  }


  function confirmTransfer() {
    if (transfTo.current && transfAssetId.current && transfMemo.current) {
      const valueInputToTransfer = transfTo.current.value;
      const valueAssetIdTransfer = transfAssetId.current.value;
      const valueAssetIdTransferFormat = [valueAssetIdTransfer];
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
    onClose()
  }



  return (
    <>
      <Box p={4}>
        <Button onClick={handleStartCountdown}>Submit</Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent >
            <ModalHeader>Confirm Transfer Data !!!</ModalHeader>
            <ModalCloseButton />
            <Code border={'1px'} background={'#47474b;'}>
            <ModalBody>
              <Box p='2'>
                <Text fontSize='lg'>From: {session?.auth.actor.toString()} </Text>
              </Box>
              <Box p='2'>
                <Text fontSize='lg'>To: {transfTo.current?.value} </Text>
              </Box>
              <Box p='2'>
                  <Text fontSize='lg'>Asset_Id: {transfAssetId.current?.value} </Text>
              </Box>
              <Box p='2'>
                <Text fontSize='lg'>Memo: {transfMemo.current?.value}</Text>
                </Box>
            </ModalBody>
            </Code>
            <ModalFooter>
              <Box p='2'>
                <Text
                  fontSize="lg"
                  color={'orange'}> {timeLeft === 0 ? "Time limit exceeded !!!" : `Time to confirm: ${timeLeft}`}
                </Text>
              </Box>
              <Box p='2'>
                <Button
                  colorScheme={"red"}
                  mr={3}
                  onClick={() => timeLeft === 0 ? onClose() : confirmTransfer()}> {timeLeft === 0 ? 'Back' : 'Confirm'}
                </Button>
                {/* <Button colorScheme={"red"} mr={3} onClick={confirmTransfer}>Confirm </Button> */}
                {/* <Button colorScheme={"red"} mr={3} onClick={onClose}>Reject</Button> */}
              </Box>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  )
}



export default NftTransferConfirmModal

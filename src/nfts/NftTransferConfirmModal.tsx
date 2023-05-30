import { useState, useEffect } from 'react';
import { useAnchor } from '@nice1/react-tools'
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



const NftTransferConfirmModal = ({ transfTo, transfAssetId, transfMemo, transMesError, resultTransfer, closeModalTransfer }: any) => {

  const timeCountDown = 60 // Indicate number of definitive seconds
  const { session } = useAnchor()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [timeLeft, setTimeLeft] = useState(timeCountDown)
  const [isCountdownActive, setIsCountdownActive] = useState(false)

  useEffect(() => {
    if (isCountdownActive && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (isCountdownActive && timeLeft === 0) {
      //onClose();
    }
  }, [isCountdownActive, timeLeft, onClose]);


  /***
   * If you validate that it is not empty and that there are only lowercase and numbers, activate the countdown...
   */
  const handValidateInputs = () => {
    if (transfTo.current.value.trim() !== '') {
      if (validateValueInput(transfTo.current.value)) {
        setIsCountdownActive(true);
        setTimeLeft(timeCountDown)
        //setvalueToTransf(transfTo.current.value)
        onOpen()
      } else {
        transMesError.current.value = "Only lowercase and numbers !!!"
        }
    } else {
      transMesError.current.value = "Enter target account !!!"
      }
  }


  /***
   * Validate that there are only lowercase and numbers...
   */
  const validateValueInput = (text) => {
    const regex = /^[a-z0-9]+$/;
    return regex.test(text);
  }


  function confirmTransfer() {
    if (transfTo.current && transfAssetId && transfMemo.current) {
      const valueInputToTransfer = transfTo.current.value;
      const valueAssetIdTransferFormat = [transfAssetId];
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
    resultTransfer = true
    closeModalTransfer(resultTransfer)
    //onClose()
  }



  return (
    <>
      <Box p={4}>
        <Button onClick={handValidateInputs}>Submit</Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent >
            <ModalHeader fontSize='md' textAlign='center'>Confirm Transfer Data !!!</ModalHeader>
            <ModalCloseButton />
            <Code border={'1px'} background={'#47474b;'}>
              <ModalBody>
                <Box p='1'>
                  <Text fontSize='lg'>From: {session?.auth.actor.toString()} </Text>
                  <Text fontSize='lg'>To: {transfTo.current?.value} </Text>
                </Box>
                <Box p='1'>
                  <Text fontSize='lg'>Asset_Id: {transfAssetId} </Text>
                  <Text fontSize='lg'>Memo: {transfMemo.current?.value}</Text>
                </Box>
            </ModalBody>
            </Code>
            <ModalFooter>
              <Box p='1'>
                <Text
                  fontSize="lg"
                  color={'orange'}> {timeLeft === 0 ? "Time limit exceeded !!!" : `Time to confirm: ${timeLeft}`}
                </Text>
              </Box>
              <Box p='1'>
                <Button
                  colorScheme={"red"}
                  mr={3}
                  onClick={() => timeLeft === 0 ? onClose() : confirmTransfer()}> {timeLeft === 0 ? 'Back' : 'Confirm'}
                </Button>
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

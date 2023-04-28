import { useState, useEffect } from 'react'
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
  Text,
  useDisclosure,


} from '@chakra-ui/react'

const NftDelegateConfirmModal = ({ delegTo, delegAssetId, delegEpochLimite, delegRedeleg, delegMemo } : any) => {

  const { session } = useAnchor()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [epochActual, setEpochActual] = useState(Date.now());
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



  function confirmDelegate() {
    if (delegTo.current && delegAssetId.current && delegEpochLimite.current && delegRedeleg && delegMemo.current) {

      const valueToDelegate = delegTo.current.value;
      const valueAssetIdDelegate = delegAssetId.current.value;
      const valueAssetIdDelegateFormat = [valueAssetIdDelegate];
      const valueEpochLimite = delegEpochLimite.current.value;
      const valueEpochLimiteFor = [valueEpochLimite];
      //const valueDelegRedeleg = delegRedeleg

      //const valuePeriod = valueEpochLimiteFor - epochActual / 1000
      // valueSwitchRedelegate

      const valueMemoDelegate = delegMemo.current.value;


      session?.transact({
        action: {
          account: 'simpleassets',
          name: 'delegate',
          authorization: [session.auth],
          data: {
            owner: session.auth.actor,
            to: valueToDelegate,
            assetids: valueAssetIdDelegateFormat,
            //period: valueEpochLimiteFor ,
            //redelegate: valueSwitchRedelegate,
            memo: valueMemoDelegate
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
          <ModalContent>
            <ModalHeader>Confirm Delegation Data !!!</ModalHeader>
            <ModalCloseButton />
            <Code border={'1px'} background={'#47474b;'}>
            <ModalBody>
              <Box p='2'>
                <Text fontSize='lg'>From: {session?.auth.actor.toString()} </Text>
              </Box>
              <Box p='2'>
                  <Text fontSize='lg'>To: {delegTo.current?.value}</Text>
              </Box>
              <Box p='2'>
                <Text fontSize='lg'>Asset_Id: {delegAssetId.current?.value}</Text>
              </Box>

              <Box p='2'>
                <Text fontSize='lg'>Redelegate: {delegRedeleg ? "Activated" : "Deactivated"} </Text>
              </Box>
              <Box p='2'>
                <Text fontSize='lg'>Memo: {delegMemo.current?.value}</Text>
              </Box>
              <Box p='2'>
                  <Text fontSize='lg'>Fecha Actual (Epoch): {Math.floor(epochActual / 1000)} </Text>
              </Box>
              {/* <Box p='2'>
                  <Text fontSize='lg'>Fecha Limite (Epoch): {Math.floor(delegEpochLimite.current.value )}</Text>
              </Box>
              <Box p='2'>
                  <Text fontSize='lg'>Time Delegate (Epoch): {Math.floor((delegEpochLimite.current.value) - (epochActual / 1000))} </Text>
              </Box> */}
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
                  onClick={() => timeLeft === 0 ? onClose() : confirmDelegate()}> {timeLeft === 0 ? 'Back' : 'Confirm'}
                </Button>
              </Box>
              </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  )
}

export default NftDelegateConfirmModal

import { useState, useEffect } from 'react'
import { useAnchor } from '@nice1/react-tools'
import { useNftSimpleAssets } from '../../hooks/NftSimpleAssets'
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



const NftDelegateConfModal = ({ delegTo, delegAssetId, delegEpochLimit, delegRedeleg, delegMemo, delMesError, isOkResultTrans, infoTransaction,  closeModalDelegation } : any) => {

  const { session } = useAnchor()
  const { isOpen, onOpen, onClose } = useDisclosure()


  const timeCountDown = 60 // Indicate number of definitive seconds
  const secondsDay = 86400 // seconds in a day
  const oneThousand = 1000

  const [timeLeft, setTimeLeft] = useState(timeCountDown);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  const [epochCurrent, setEpochActual] = useState(Date.now());
  const dateCurrent = new Date(epochCurrent);
  const dateCurrentFormat = dateCurrent.toDateString();

  const epochLimit = delegEpochLimit.current?.value * oneThousand
  const dateLimit = new Date(epochLimit);
  const dateLimitFormat = dateLimit.toDateString();


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


  const handValidateInputs = () => {
    if (delegTo.current.value.trim() !== '') {
      if (validateValueInput(delegTo.current.value)) {
        setIsCountdownActive(true);
        setTimeLeft(timeCountDown)
        onOpen()
      } else {
        delMesError.current.value = "Only lowercase and numbers !!!"
      }
    } else {
      delMesError.current.value = "Enter target account !!!"
    }
  }

  const validateValueInput = (text) => {
    const regex = /^[a-z0-9]+$/;
    return regex.test(text);
  }


  function confirmDelegate() {
    if (delegTo.current && delegAssetId && delegEpochLimit.current && delegRedeleg && delegMemo.current) {
      const valueToDelegate = delegTo.current.value;
      const valueAssetIdDelegateFormat = [delegAssetId];
      const valueEpochLimite = delegEpochLimit.current.value - Math.floor(epochCurrent / oneThousand) ;
      //const valueEpochLimiteFor = [valueEpochLimite];
      const valueDelegRedeleg = delegRedeleg
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
            period: valueEpochLimite,
            redelegate: valueDelegRedeleg,
            memo: valueMemoDelegate
          }
        }
      }).then((response) => {
        console.log(`Result: ${response}`)
        isOkResultTrans = true
        infoTransaction = response.payload.tx //tx
        closeModalDelegation(isOkResultTrans, infoTransaction)
        return response;
      }).catch((e) => {
        console.log(`Error: ${e}`)
        isOkResultTrans = false
        closeModalDelegation(isOkResultTrans)
      })
    }
  }


  return (
    <>
      <Box p={4}>
        <Button onClick={handValidateInputs}>Submit</Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontSize='md' textAlign='center'>Confirm Delegation Data !!!</ModalHeader>
            <ModalCloseButton />
            <Code border={'1px'} background={'#47474b;'}>
              <ModalBody>
                <Box p={1}>
                  <Text fontSize='lg'>From: {session?.auth.actor.toString()} </Text>
                  <Text fontSize='lg'>To: {delegTo.current?.value}</Text>
                </Box>
                <Box p={1}>
                  <Text fontSize='lg'>Asset_Id: {delegAssetId}</Text>
                  <Text fontSize='lg'>Redelegate: {delegRedeleg ? "Activated" : "Deactivated"} </Text>
                  <Text fontSize='lg'>Memo: {delegMemo.current?.value}</Text>
                </Box>
                <Box p={1}>
                  <Text fontSize='lg'>Fecha Actual: {dateCurrentFormat} </Text>
                  <Text fontSize='lg'>Epoch Actual: {Math.floor(epochCurrent / oneThousand)} </Text>
                </Box>
                <Box p={1}>
                  <Text fontSize='lg'>Fecha Limite: {dateLimitFormat}</Text>
                  <Text fontSize='lg'>Epoch Limite: {Math.floor(delegEpochLimit.current?.value)}</Text>
                </Box>
                <Box p={1}>
                  <Text fontSize='lg'>Time legate: {Math.floor(delegEpochLimit.current?.value) - Math.floor(epochCurrent / oneThousand)} </Text>
                  <Text fontSize='lg'>Dias Aprox.: {(Math.floor(delegEpochLimit.current?.value) - Math.floor(epochCurrent / oneThousand)) / secondsDay} </Text>
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

export default NftDelegateConfModal

import { useState } from 'react'
import { useAnchor } from '@nice1/react-tools'

import {
  Button,
  Box,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Switch,
  Text,
  useDisclosure,
  Input

} from '@chakra-ui/react'

const NftDelegateConfirmModal = ({ delegTo, delegAssetId, delegEpochLimite, delegRedeleg, delegMemo } : any) => {

  const { session } = useAnchor()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [epochActual, setEpochActual] = useState(Date.now());


  function calcularPeriodo() {
    setEpochActual (Date.now())
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
                <Text fontSize='lg'>To: <strong>{delegTo.current?.value}</strong></Text>
              </Box>
              <Box p='2'>
                <Text fontSize='lg'>Asset Id:<strong>{delegAssetId.current?.value}</strong> </Text>
              </Box>

              <Box p='2'>
                <Text fontSize='lg'>Redelegate: <strong>{delegRedeleg ? "Activated" : "Deactivated"}</strong> </Text>
              </Box>
              <Box p='2'>
                <Text fontSize='lg'>Memo: <strong>{delegMemo.current?.value}</strong></Text>
              </Box>
              <Box p='2'>
                <Text fontSize='lg'>Fecha Actual: <strong>{Math.floor(epochActual / 1000)}</strong> </Text>
              </Box>
              {/*<Box p='2'>
                <Text fontSize='lg'>Fecha Limite: <strong>{Math.floor(delegEpochLimite.current.value )}</strong> </Text>
              </Box>
              <Box p='2'>
                <Text fontSize='lg'>Time Delegate: <strong>{Math.floor((delegEpochLimite.current.value) - (epochActual / 1000))}</strong> </Text>
              </Box>*/}
              </ModalBody>
            <ModalFooter>
              <Button colorScheme={"red"} mr={3} onClick={calcularPeriodo}>Capturar Fecha Actual</Button>
              <Button colorScheme={"red"} mr={3} onClick={confirmDelegate}>Confirm</Button>
              <Button colorScheme={"red"} mr={3} onClick={onClose}>Reject</Button>
              </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  )
}

export default NftDelegateConfirmModal

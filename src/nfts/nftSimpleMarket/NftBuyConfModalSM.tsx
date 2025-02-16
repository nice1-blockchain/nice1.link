import { useState, useEffect } from 'react';
import { useAnchor } from '@nice1/react-tools'
import { useNftSimpleMarket } from '../../hooks/NftSimpleMarket'
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
  Text
} from '@chakra-ui/react'



export const NftBuyConfModalSM = ({ asset }: any ) => {

  const { session } = useAnchor()
  const { updateNfts } = useNftSimpleMarket()
  const timeCountDown = 60
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [timeLeft, setTimeLeft] = useState(timeCountDown)
  const [isCountdownActive, setIsCountdownActive] = useState(false)

  const [resultTransaction, setResulTransaction] = useState(false)
  const [infoTransaction, setInfoTransaction] = useState('')

  const [modalResulTranSuccess, setModalResulTranSuccess] = useState(false);
  const [modalResulTransError, setModalResulTransOpenError] = useState(false);



  useEffect(() => {
    if (isCountdownActive && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (isCountdownActive && timeLeft === 0) {
      setIsCountdownActive(false)
      //onClose();
    }
  }, [isCountdownActive, timeLeft, onClose]);


  const confirmBuy = () => {
    if (isCountdownActive) {
      session?.transact({
        actions: [
          {
            account: "eosio.token",
            name: "transfer",
            authorization: [session.auth],
            data: {
              from: session.auth.actor,
              to: "simplemarket",
              quantity: asset.price,
              memo: `{ "nftid":${asset.id} }`
            }
          },
          {
            account: "simpleassets",
            name: "claim",
            authorization: [session.auth],
            data: {
              claimer: session.auth.actor,
              assetids: [asset.id]
            }
          }
        ]
      }).then((response) => {
        //setTimeout(updateNfts, 250,);
        //return result;
        console.log(`Result: ${response}`)
        let resultTrans = true
        //setResulTransaction(resultTrans)
        let infoTrans = response.payload.tx //tx
        //setInfoTransaction(infoTrans)
        closeModalTransfer(resultTrans, infoTrans)
        return response

      }).catch((e) => {
        console.log(`Error: ${e}`)
        let resultTrans = false
        closeModalTransfer(resultTrans, e)
      })
    }
  }


  const activateCounter = () => {
    setIsCountdownActive(true);
    setTimeLeft(timeCountDown)
    onOpen()
  }


  const closeModalTransfer = (resTrans: boolean, infoTrans: any) => {
    if (resTrans) {
      onClose()
      setModalResulTranSuccess(true)
      setInfoTransaction(infoTrans)
    } else {
      onClose()
      setModalResulTransOpenError(true)
      //setInfoTransaction(infoTrans)
    }
  }

  const closePopups = () => {
    setTimeout(updateNfts, 100,);
    setResulTransaction(false)
    setInfoTransaction('')
    setModalResulTranSuccess(false)
    setModalResulTransOpenError(false)
  }



  return (
    <>
      <Box p={4}>
        <Button border={'1px'} onClick={activateCounter}>Buy</Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent >
            <ModalHeader fontSize='md' textAlign='center'>Confirm Buy Data !!!</ModalHeader>
            <ModalCloseButton />
            <Code border={'1px'} background={'#47474b;'}>
              <ModalBody>
                <Box p='1'>
                  <Text fontSize='lg'>From: simplemarket </Text>
                </Box>
                <Box p='1'>
                  <Text fontSize='lg'>To: {session?.auth.actor.toString()} </Text>
                </Box>
                <Box p='1'>
                  <Text fontSize='lg'>NFT Id: {asset.id} </Text>
                </Box>
                <Box p='1'>
                  <Text fontSize='lg'>Price: {asset.price} </Text>
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
                  onClick={() => timeLeft === 0 ? onClose() : confirmBuy()}> {timeLeft === 0 ? 'Back' : 'Confirm'}
                </Button>
              </Box>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>


      <Box>
        <Modal isOpen={modalResulTranSuccess} onClose={closePopups}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Transaction result</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box p='1'>
                <Text fontSize='small'>Transaction {infoTransaction} was successful !!!</Text>
              </Box>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>

      <Box>
        <Modal isOpen={modalResulTransError} onClose={closePopups}>
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

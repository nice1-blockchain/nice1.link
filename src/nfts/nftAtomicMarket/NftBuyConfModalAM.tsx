import { useState, useEffect } from 'react';
import { useAnchor } from '@nice1/react-tools'
import { useNftAtomicMarket } from '../../hooks/NftAtomicMarket'
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



export const NftBuyConfModalAM = ({ asset }: any) => {

  const { session } = useAnchor()
  const { updateNftsAM } = useNftAtomicMarket()
  const timeCountDown = 60
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [timeLeft, setTimeLeft] = useState(timeCountDown)
  const [isCountdownActive, setIsCountdownActive] = useState(false)

  const [isOkResultTransaction, setIsOkResultTransaction] = useState(false)
  const [infoTransaction, setInfoTransaction] = useState('')

  const [isOpenModalResulTranSuccess, setIsOpenModalResulTranSuccess] = useState(false);
  const [isOpenModalResulTransError, setIsOpenModalResulTransOpenError] = useState(false);


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
    if (isCountdownActive ) {
      session?.transact({
        actions: [
          {
            account: "atomicmarket",
            name: "assertsale",
            authorization: [session.auth],
            data: {
              sale_id: asset.sale_id,
              asset_ids_to_assert: asset.asset_ids,
              listing_price_to_assert: asset.listing_price,
              settlement_symbol_to_assert: asset.settlement_symbol
            }
          },
          {
            account: "eosio.token",
            name: "transfer",
            authorization: [session.auth],
            data: {
              from: session.auth.actor,
              to: "atomicmarket",
              quantity: asset.listing_price,
              memo: "deposit"
            }
           },
          {
            account: "atomicmarket",
            name: "purchasesale",
            authorization: [session.auth],
            data: {
              buyer: session.auth.actor,
              sale_id: asset.sale_id,
              intended_delphi_median: 0,
              taker_marketplace: ""
            }
          }
        ]
      }).then((response) => {
        console.log(`Result: ${response}`)
        let isOkResultTrans = true
        let infoTrans = response.payload.tx //tx
        closeModalTransfer(isOkResultTrans, infoTrans)
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


  const closeModalTransfer = (isOkResTrans: boolean, infoTrans: any) => {
    if (isOkResTrans) {
      onClose()
      setIsOpenModalResulTranSuccess(true)
      setInfoTransaction(infoTrans)
    } else {
      onClose()
      setIsOpenModalResulTransOpenError(true)
      //setInfoTransaction(infoTrans)
    }
  }

  const closePopups = () => {
    setTimeout(updateNftsAM, 250,);
    setIsOkResultTransaction(false)
    setInfoTransaction('')
    setIsOpenModalResulTranSuccess(false)
    setIsOpenModalResulTransOpenError(false)
  }



  return (
    <>
      <Box p={4}>
        <Button marginLeft={'-4'} border={'1px'} onClick={activateCounter}>Buy</Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent >
            <ModalHeader fontSize='md' textAlign='center'>Confirm Buy Data !!!</ModalHeader>
            <ModalCloseButton />
            <Code border={'1px'} background={'#47474b;'}>
              <ModalBody>
                <Box p='1'>
                  <Text fontSize='lg'>Asset ID: {asset.asset_ids} </Text>
                </Box>
                <Box p='1'>
                  <Text fontSize='lg'>listing_price: {asset.listing_price}</Text>
                </Box>
                <Box p='1'>
                  <Text fontSize='lg'>Sale_id: {asset.sale_id}</Text>
                </Box>
                <Box p='1'>
                  <Text fontSize='lg'>settlement_symbol...: {asset.settlement_symbol}</Text>
                </Box>
                <Box p='1'>
                  <Text fontSize='lg'>seller: {asset.seller} </Text>
                </Box>
                <Box p='1'>
                  <Text fontSize='lg'>To: {session?.auth.actor.toString()} </Text>
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
        <Modal isOpen={isOpenModalResulTranSuccess} onClose={closePopups}>
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

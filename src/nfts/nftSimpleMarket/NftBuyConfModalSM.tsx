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



export const NftBuyConfModal = ({ asset }: any ) => {

  const { session } = useAnchor()
  const { updateNfts } = useNftSimpleMarket()
  const timeCountDown = 60
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
      }).then((result) => {
        setTimeout(updateNfts, 250,);
        return result;
      }).catch((e) => {
        console.log(`Error: ${e}`)
      })
    }
  }


  const activateCounter = () => {
    setIsCountdownActive(true);
    setTimeLeft(timeCountDown)
    onOpen()
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
    </>
  )
}

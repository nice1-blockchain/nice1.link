import React from 'react';
import { useAnchor } from '@nice1/react-tools'
import { useNftSimpleAssets } from '../hooks/NftsProvider'
import { useRef, useState } from 'react'


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
  VStack,
  Text,
  FormLabel,
  Input,
  GridItem

} from '@chakra-ui/react'



const NftModalTransfer = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { session } = useAnchor()
  const { nfts } = useNftSimpleAssets()
  const aliasRef = useRef<HTMLInputElement>(null)

  function submitTransfer() {

    session?.transact({
      action : {
        account: 'simpleassets',
        name: 'transfer',
        authorization: [session.auth],
        data: {
          from: session.auth.actor,
          to: 'niceonetest1',
          assetids: [100000000000006],
          memo: 'Test transfer...'
        }
      }
    }).then((result) => {
      console.log(result);
        return result;
    })
  }


  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size='sm' initialFocusRef={aliasRef}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize='md' textAlign='center'>Transfer Assets:</ModalHeader>
          <ModalBody>
            <VStack spacing={2} align='start'>
              <FormControl mt={4}>
                <FormLabel htmlFor='account'>From:</FormLabel>
                <Input id='account' type='text' readOnly value={session?.auth.actor.toString()} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel htmlFor='accountTo'>To:</FormLabel>
                <Input type='text' placeholder='Indicar Cuenta que Recibe el Asset...' />
              </FormControl>

              {/* TODO: Pendiente autocompletar....*/}
              <FormControl mt={4}>
                <FormLabel htmlFor='assetids'>Asset Id:</FormLabel>
                <Input type='text' placeholder='Indicar assetids entre []...' />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel htmlFor='memo'>Memo:</FormLabel>
                <Input type='text' placeholder='Campo memo...' />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={submitTransfer} mr={3}>Submit Transfer</Button>
            <Button onClick={onClose} variant='outline'>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>



    </>
  )
}

export default NftModalTransfer;


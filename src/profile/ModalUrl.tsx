import {
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import { useRef, useState } from 'react'

const ModalURL = ({isOpen, onClose, setAvatar} : any) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<null|string>(null)
  const isInvalid = error !== null

  const setAvatarState = () => {
    if (!inputRef.current) {
      return
    }

    setAvatar(inputRef.current.value)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xs' initialFocusRef={inputRef}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize='md' textAlign='center'>Set custom avatar URL</ModalHeader>
        <ModalBody>
          <FormControl isInvalid={isInvalid}>
            <Input
              type='text'
              ref={inputRef}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (!/^(https?|ipfs):\/\//.test(e.target.value)) {
                  setError('Has to be either an http or ipfs link')
                } else {
                  setError(null)
                }
              }}
            />
            <FormErrorMessage>{error}</FormErrorMessage>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} disabled={isInvalid || !inputRef.current?.value.length} onClick={setAvatarState}>Set</Button>
          <Button onClick={onClose} variant='outline'>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalURL

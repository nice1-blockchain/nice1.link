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
import { useEffect, useRef, useState } from 'react'

const ModalURL = ({isOpen, onClose, setAvatar} : any) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<null|string>(null)
  const [invalid, setInvalid] = useState<boolean>(true)

  useEffect(() => {
    if (!inputRef.current?.value.length) {
      return
    }

    setInvalid(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inputRef.current
  ])

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
          <FormControl isInvalid={error !== null}>
            <Input
              type='text'
              ref={inputRef}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (!/^(https?|ipfs):\/\//.test(e.target.value)) {
                  setError('Has to be either an http or ipfs link')
                } else {
                  setError(null)
                  setInvalid(false)
                }
              }}
            />
            <FormErrorMessage>{error}</FormErrorMessage>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} disabled={invalid || error !== null} onClick={setAvatarState}>Set</Button>
          <Button onClick={onClose} variant='outline'>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalURL

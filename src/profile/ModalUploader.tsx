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
  ModalOverlay
} from '@chakra-ui/react'
import { create } from 'ipfs-http-client'
import { useRef, useState } from 'react'
import { IMAGE_ALLOWED_TYPES } from '../constants'
import { Buffer } from 'buffer';

const ModalUploader = ({isOpen, onClose, setAvatar} : any) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File>()
  const [error, setError] = useState<string|null>(null)
  const [uploading, setUploading] = useState<boolean>(false)

  const ipfsClient = require('ipfs-http-client');

  const pId = process.env.REACT_APP_AKY_INF;
  const pSe = process.env.REACT_APP_AKS_INF;



  const upload = async () => {
    //const client = create({ url: 'https://ipfs.infura.io:5001/api/v0' }) // Bolet !!!

    const auth = 'Basic ' + Buffer.from(pId + ':' + pSe).toString('base64'); // TODO from backend...
    const client = ipfsClient.create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      //apiPath: '/api/v0',
      headers: {
        authorization: auth,
      },
    });

    if (!file) {
      setError('no file selected')
      return
    }

    setUploading(true)

    try {
      const result = await client.add(file)

      setAvatar(`ipfs://${result.path}`)

      onClose()
    } catch (e) {
      setError('Error uploading, check console for details')
      console.error(e)
    }

    setUploading(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xs' initialFocusRef={fileRef}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize='md' textAlign='center'>Upload avatar to IPFS</ModalHeader>
        <ModalBody>
          <FormControl isInvalid={error !== null}>
            <Input
              type='file'
              accept={IMAGE_ALLOWED_TYPES.join(',')}
              ref={fileRef}
              onChange={() => {
                if (!fileRef.current || !fileRef.current.files) {
                  return
                }

                setFile(fileRef.current.files[0])
                setError(null)
              }}
            />
            <FormErrorMessage>{error}</FormErrorMessage>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button
            mr={3}
            onClick={upload}
            disabled={!file || error !== null || uploading}
            isLoading={uploading}
          >
            Upload
          </Button>
          <Button onClick={onClose} variant='outline'>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ModalUploader

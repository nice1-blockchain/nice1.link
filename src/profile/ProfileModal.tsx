import {
  Box,
  Button,
  FormLabel,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { useAnchor, useNice1 } from '@nice1/react-tools'
import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import ModalUploader from './ModalUploader'
import ModalURL from './ModalUrl'
import Avatar from '../components/Avatar'

const ChangeAvatarOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: none;
  justify-content: center;
  align-items: center;
`

const AvatarWrapper : typeof Box = styled(Box)`
  position: relative;

  &:hover {
    > div {
      display: flex;
    }

    img {
      filter: brightness(50%) grayscale(30%);
    }
  }

  img {
    min-height: 100px;
    min-width: 100px;
  }
`


const ProfileModal = ({isOpen, onClose} : {isOpen: boolean, onClose: () => void}) => {
  const { session } = useAnchor()
  const { profile, updateProfile, setAvatar, setAlias } = useNice1()
  const aliasRef = useRef<HTMLInputElement>(null)
  const [ avatarUrl, setAvatarUrl ] = useState<string|null>(null)
  const {
    isOpen: isFileModalOpen,
    onOpen: onFileModalOpen,
    onClose: onFileModalClose,
  } = useDisclosure()
  const {
    isOpen: isUrlModalOpen,
    onOpen: onUrlModalOpen,
    onClose: onUrlModalClose,
  } = useDisclosure()

  const save = async () => {
    if (!aliasRef.current) {
      return
    }

    const avatar = avatarUrl ? avatarUrl : ''
    const alias = aliasRef.current?.value

    try {
      if (avatar !== profile.avatar && alias !== profile.alias) {
        await updateProfile({alias, avatar})
      }
      // using different methods for each one for cheaper transactions
      if (avatar !== profile.avatar && alias === profile.alias) {
        await setAvatar(avatar)
      }
      if (alias !== profile.alias && avatar === profile.avatar) {
        await setAlias(alias)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size='xs' initialFocusRef={aliasRef}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize='md' textAlign='center'>Edit your profile</ModalHeader>
          <ModalBody>
            <VStack spacing={2} align='start'>
              <Box>
                <Text>Avatar:</Text>
                <AvatarWrapper>
                  <Avatar avatar={avatarUrl || profile.avatar} alignSelf='center' marginX='40px' />
                  <ChangeAvatarOverlay>
                    <Menu>
                      <MenuButton>Change image</MenuButton>
                      <MenuList>
                        <MenuItem onClick={onFileModalOpen}>Upload to IPFS</MenuItem>
                        <MenuItem onClick={onUrlModalOpen}>Set custom URL</MenuItem>
                      </MenuList>
                    </Menu>
                  </ChangeAvatarOverlay>
                </AvatarWrapper>
              </Box>
              <Box>
                <FormLabel htmlFor='account'>Account:</FormLabel>
                <Input id='account' type='text' readOnly value={session?.auth.actor.toString()} />
              </Box>
              <Box>
                <FormLabel htmlFor='alias'>A.K.A. (alias):</FormLabel>
                <Input id='alias' type='text' defaultValue={profile.alias as string} ref={aliasRef} />
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button onClick={save} mr={3}>Save</Button>
            <Button onClick={onClose} variant='outline'>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ModalUploader isOpen={isFileModalOpen} onClose={onFileModalClose} setAvatar={setAvatarUrl} />
      <ModalURL isOpen={isUrlModalOpen} onClose={onUrlModalClose} setAvatar={setAvatarUrl} />
    </>
  )
}

export default ProfileModal

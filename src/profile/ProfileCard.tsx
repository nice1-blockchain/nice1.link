import { Box, IconButton, Text, useDisclosure } from '@chakra-ui/react'
import { useAnchor, useNice1 } from '@nice1/react-tools'
import styled from 'styled-components'

import { ReactComponent as EditIcon } from '../icons/edit.svg'
import Avatar from '../components/Avatar'
import DashboardBox from '../components/DashboardBox'
import ProfileModal from './ProfileModal'


const SVGIconButton : typeof IconButton = styled(IconButton)`
  svg {
    width: 100%;
    height: 100%;
  }
`


const ProfileCard = () => {
  const { session } = useAnchor()
  const { profile } = useNice1()
  const { isOpen, onClose, onOpen } = useDisclosure()

  return (
    <DashboardBox>
      <Box mr={4} flexBasis='min-content'>
        <Avatar avatar={profile.avatar} w='80px' />
      </Box>
      <Box display='flex' alignItems='start' flexDir='column' flex='2 auto'>
        <Text fontSize='xs'>
          Account:
        </Text>
        <Text fontSize='md' fontWeight='semibold'>
          {session?.auth.actor.toString()}
        </Text>
        <Text fontSize='xs'>
          A.K.A.:
        </Text>
        <Text fontSize='md' fontWeight='semibold'>
          {profile.alias || 'not defined'}
        </Text>
      </Box>
      <SVGIconButton
        variant='link'
        aria-label='edit profile'
        icon={<EditIcon />}
        ml={4}
        size='xs'
        height='15px'
        onClick={onOpen}
      />
      <ProfileModal isOpen={isOpen} onClose={onClose} />
    </DashboardBox>
  )
}

export default ProfileCard

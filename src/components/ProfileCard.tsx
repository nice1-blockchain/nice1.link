import { Box, IconButton, Text } from '@chakra-ui/react'
import { useAnchor, useNice1 } from '@nice1/react-tools'
import styled from 'styled-components'

import { ReactComponent as EditIcon } from '../icons/edit.svg'
import { Image } from '../ipfs'
import DashboardBox from './DashboardBox'


const SVGIconButton : typeof IconButton = styled(IconButton)`
  svg {
    width: 100%;
    height: 100%;
  }
`


const ProfileCard = () => {
  const { session } = useAnchor()
  const { profile } = useNice1()

  return (
    <DashboardBox>
      <Box display='flex' w='80px' h='80px' justifyContent='center' alignItems='center' mr={4}>
        <Image
          src={profile.avatar as string}
          alt={`${profile.alias} avatar`}
          maxH='100%'
          rounded='xl'
        />
      </Box>
      <Box display='flex' alignItems='start' flexDir='column'>
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
      />
    </DashboardBox>
  )
}

export default ProfileCard

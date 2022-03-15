import { Box, Button, Flex, Heading, IconButton, Image, Stack, Text } from '@chakra-ui/react'
import { useAnchor } from '@nice1/react-tools'
import styled from 'styled-components'

import { ReactComponent as Anchor } from '../icons/anchor.svg'
import { ReactComponent as Git } from '../icons/git.svg'
import { ReactComponent as Mail } from '../icons/mail.svg'
import { ReactComponent as Telegram } from '../icons/telegram.svg'
import { ReactComponent as Twitter } from '../icons/twitter.svg'

const SVGIconButton : typeof IconButton = styled(IconButton)`
  svg {
    max-height: 130%;
  }
`

const Login = () => {
  const { login } = useAnchor()

  return (
    <Flex
      justifyContent='center'
      minH='100vh'
      bg={`center center no-repeat url(${process.env.PUBLIC_URL}/stars.svg) black`}
      bgSize='cover'
    >
      <Flex
        direction='row'
        rounded={10}
        overflow='hidden'
        alignSelf='center'
        margin={0}
      >
        <Flex
          display={{base: 'none', md: 'flex'}}
          bg={{base: 'none', md: `center center no-repeat url(${process.env.PUBLIC_URL}/bg_army.png)`}}
          bgSize='cover'
          minH={{base: 'auto', lg: 500}}
          width={470}
          alignItems='center'
          justifyContent='center'
          p={10}
        >
          <Image
            alt='Be part of the revolution #WeAreN1Army'
            objectFit={'cover'}
            src={`${process.env.PUBLIC_URL}/claim.png`}
          />
        </Flex>
        <Flex
          p={8}
          flex={1}
          align={'center'}
          justify={'center'}
          bgGradient='linear(to-tr, bgs.gradientStart, bgs.gradientEnd)'
        >
          <Stack spacing={6} w={'full'} maxW={'lg'}>
            <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}>
              <Box justifyContent='center' display='flex'>
                <Image src={`${process.env.PUBLIC_URL}/logo_detailed.png`} alt='Nice1 logo' />
              </Box>
            </Heading>
            <Button
              variant='login'
              alignSelf='center'
              leftIcon={<Anchor />}
              onClick={login}
            >
              Login
            </Button>
            <Stack direction='column' align='center'>
              <Text fontSize='xs'>Follow/contact us</Text>
              <Stack direction='row' justifyContent='center'>
                <SVGIconButton
                  aria-label='twitter'
                  title='follow us on twitter'
                  variant='link'
                  icon={<Twitter />}
                  onClick={() => {window.open('https://twitter.com/nice1blockchain', '_blank')}}
                />
                <SVGIconButton
                  aria-label='git'
                  title='help us contributing'
                  variant='link'
                  icon={<Git />}
                  onClick={() => {window.open('https://github.com/nice1-blockchain', '_blank')}}
                />
                <SVGIconButton
                  aria-label='telegram'
                  title='come chat with us'
                  variant='link'
                  icon={<Telegram />}
                  onClick={() => {window.open('https://t.me/nice1blockchain', '_blank')}}
                />
                <SVGIconButton
                  aria-label='e-mail'
                  title='e-mail us'
                  variant='link'
                  icon={<Mail />}
                  onClick={() => {window.location.href = 'mailto:hello@nice1.org'}}
                />
              </Stack>
            </Stack>
          </Stack>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default Login

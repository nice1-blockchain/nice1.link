import { Box, Button, Flex, Heading, Image, Stack } from '@chakra-ui/react'
import { useAnchor } from '@nice1/react-tools'
import Footer from '../dashboard/Footer'

import { Anchor } from '../icons'

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
          minH={{base: '100vh', md: 500}}
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
            <Footer color='white' />
          </Stack>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default Login

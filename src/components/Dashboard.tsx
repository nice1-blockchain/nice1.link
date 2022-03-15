import { Box, Button, Grid, VStack } from '@chakra-ui/react'
import { Profile, useAnchor } from '@nice1/react-tools'
import { ColorModeSwitcher } from '../ColorModeSwitcher'

export default function Dashboard() {
  const { login, logout, session } = useAnchor()

  return (
    <>
      <Box
        position='fixed'
        left={0}
        p={5}
        w={75}
        top={0}
        h='100%'
        bg='bgs.widgets'
      >
        <VStack>
          <Button>
            1
          </Button>
          <Button>
            2
          </Button>
        </VStack>
      </Box>
      <Box textAlign='center' fontSize='xl'>
        <Grid minH='100vh' p={3}>
          <ColorModeSwitcher justifySelf='flex-end' />
          <VStack spacing={8}>
            {
              session === null ?
                <button onClick={login}>Login</button> :
                <>
                  <Profile />
                  <button onClick={logout}>logout</button>
                </>
              }
          </VStack>
        </Grid>
      </Box>
    </>
  )
}

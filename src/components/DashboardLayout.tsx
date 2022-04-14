import { Box, Button, Grid, VStack } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { ReactComponent as Nft } from '../icons/nft.svg'
import { ReactComponent as User } from '../icons/user.svg'

const DashboardLayout = ({children} : {children: ReactNode}) => (
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
        <Link to='/'>
          <Button>
            n1
          </Button>
        </Link>
        <Link to='/'>
          <Button>
            <User />
          </Button>
        </Link>
        <Link to='/nfts'>
          <Button>
            <Nft />
          </Button>
        </Link>
      </VStack>
    </Box>
    <Box textAlign='center' fontSize='xl'>
      <Grid minH='100vh' p={3}>
        {children}
      </Grid>
    </Box>
  </>
)


export default DashboardLayout

import { Box } from '@chakra-ui/react'
import { ReactNode } from 'react'

import Menu from './Menu'

const DashboardLayout = ({children} : {children: ReactNode}) => (
  <Box display='flex' flexDirection='row' alignItems='stretch' minH='100vh'>
    <Box
      left={0}
      p={5}
      w={75}
      top={0}
      bg='bgs.widgets'
      borderTopLeftRadius={20}
    >
      <Menu />
    </Box>
    <Box p={5} w='calc(100% - 75px)'>
      {children}
    </Box>
  </Box>
)

export default DashboardLayout

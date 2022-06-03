import { Box, BoxProps } from '@chakra-ui/react'
import { ReactNode } from 'react'

const DashboardBox = ({children, ...props} : BoxProps & {image?: ReactNode}) => (
  <Box flex='1' justifyContent='center' display='flex' overflow='hidden' flexDir='column' bg='bgs.widgets' borderRightRadius='xl' borderBottomLeftRadius='xl'>
    {
      props.image ? props.image : null
    }
    <Box p={4} display='flex' {...props}>
      {children}
    </Box>
  </Box>
)

export default DashboardBox

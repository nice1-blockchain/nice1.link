import { Box, BoxProps } from '@chakra-ui/react'
import { ReactNode } from 'react'

const DashboardBox = ({children, ...props} : BoxProps & {image?: ReactNode}) => (
  <Box display='flex' overflow='hidden' flexDir='column' bg='bgs.widgets' borderRightRadius='xl' borderBottomLeftRadius='xl'>
    {
      props.image ? props.image : null
    }
    <Box p={4} display='flex' {...props}>
      {children}
    </Box>
  </Box>
)

export default DashboardBox

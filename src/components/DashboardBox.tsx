import { Box, BoxProps } from '@chakra-ui/react'
import { ReactNode } from 'react'

const DashboardBox = ({children, childProps, ...props} : BoxProps & {childProps?: BoxProps, image?: ReactNode}) => (
  <Box display='flex' flex='1 auto' overflow='hidden' flexDir='column' bg='bgs.widgets' borderRightRadius='xl' borderBottomLeftRadius='xl' {...props}>
    {
      props.image ? props.image : null
    }
    <Box p={4} display='flex' {...childProps}>
      {children}
    </Box>
  </Box>
)

export default DashboardBox

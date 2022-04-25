import { Box, BoxProps } from '@chakra-ui/react'

const DashboardBox = ({children, ...props} : BoxProps) => (
  <Box display='flex' bg='bgs.widgets' p={4} borderRightRadius='xl' borderBottomLeftRadius='xl' {...props}>
    {children}
  </Box>
)

export default DashboardBox

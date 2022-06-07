import { Box, HStack } from '@chakra-ui/react'
import styled from 'styled-components'

import { Discord, Git, Help, Mail, Telegram, Twitter } from '../icons'

const FooterIcons : typeof HStack = styled(HStack)`
  svg {
    width: 1.3em;
    * {
      fill: var(--chakra-colors-gray-400);
    }
  }
`

const Footer = () => (
  <>
    <Box color='gray.400' fontSize='xs' textAlign='center' mb={1}>
      Follow / contact us
    </Box>
    <FooterIcons gap={2}>
      <Mail />
      <Twitter />
      <Git />
      <Telegram />
      <Help />
      <Discord />
    </FooterIcons>
  </>
)
export default Footer

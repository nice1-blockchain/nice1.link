import { IconButton, Stack, Text } from '@chakra-ui/react'
import styled from 'styled-components'

import { Discord, Mail, Telegram, Twitter } from '../icons'

const SVGIconButton : typeof IconButton = styled(IconButton)`
  svg {
    width: 1.3em;

    & * {
      fill: ${props => props.color};
    }
  }
`

const Footer = ({color = 'var(--chakra-colors-gray-400)'} : {color?: string}) => (
  <Stack direction='column' align='center' color={color}>
    <Text fontSize='xs' mb={1}>Follow/contact us</Text>
    <Stack direction='row' justifyContent='center'>
      <SVGIconButton
        aria-label='twitter'
        title='follow us on twitter'
        variant='link'
        icon={<Twitter />}
        onClick={() => {window.open('https://twitter.com/nice1blockchain', '_blank')}}
        color={color}
      />
      <SVGIconButton
        aria-label='Discord'
        title='connect with us'
        variant='link'
        icon={<Discord />}
        onClick={() => {window.open('https://t.co/ngDHr5wyjU', '_blank')}}
        color={color}
      />
      <SVGIconButton
        aria-label='telegram'
        title='come chat with us'
        variant='link'
        icon={<Telegram />}
        onClick={() => {window.open('https://t.me/nice1blockchain', '_blank')}}
        color={color}
      />
      <SVGIconButton
        aria-label='e-mail'
        title='e-mail us'
        variant='link'
        icon={<Mail />}
        onClick={() => {window.location.href = 'mailto:hello@nice1.org'}}
        color={color}
      />
    </Stack>
  </Stack>
)
export default Footer

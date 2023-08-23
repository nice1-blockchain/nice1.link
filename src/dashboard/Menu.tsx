import { IconButton, VStack } from '@chakra-ui/react'
import { useAnchor } from '@nice1/react-tools'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import {
  N1Link,
  NFT,
  Shutdown,
  User,
} from '../icons'

const SVGIconButton : typeof IconButton = styled(IconButton)`
  svg {
    padding: 10px;
    width: 100%;
    height: auto;
  }
`

const SVGLogoButton : typeof SVGIconButton = styled(SVGIconButton)`
  svg {
    padding: 0;
  }
`

const Menu = () => {
  const { logout } = useAnchor()

  return (
    <VStack>
      <Link to='/'>
        <SVGLogoButton
          variant='link'
          aria-label='Nice1 Link'
          icon={<N1Link />}
        />
      </Link>
      <Link to='/'>
        <SVGIconButton
          variant='link'
          aria-label='User profile'
          icon={<User />}
        />
      </Link>
      <Link to='/simple-asset'>
        <SVGIconButton
          variant='link'
          aria-label='Nft collection'
          icon={<NFT />}
        />
      </Link>
      <Link to='/simple-market'>
        <SVGIconButton
          variant='link'
          aria-label='Nft collection'
          icon={<NFT />}
        />
      </Link>
      <Link to='/atomic-asset'>
        <SVGIconButton
          variant='link'
          aria-label='Nft collection'
          icon={<NFT />}
        />
      </Link>
      <SVGIconButton
        variant='link'
        aria-label='Logout'
        icon={<Shutdown />}
        onClick={logout}
      />
    </VStack>
  )
}

export default Menu

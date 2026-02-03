import { IconButton, VStack, Spinner } from '@chakra-ui/react'
import { useAnchor } from '@nice1/react-tools'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { AddIcon, Icon } from '@chakra-ui/icons'
import { MdStorefront } from 'react-icons/md';

import {
  N1Link,
  NFT,
  Shutdown,
  User,
} from '../icons'
import { useWhitelist } from '../hooks/useWhitelist'

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
  const { isWhitelisted, loading: whitelistLoading } = useWhitelist()
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
          title="User profile"
        />
      </Link>
      {/* Creator menu - only visible for whitelisted users */}
      {whitelistLoading ? (
        <Spinner size="sm" color="gray.500" />
      ) : isWhitelisted ? (
        <Link to='/creator'>
          <SVGIconButton
            variant='link'
            aria-label='Creator'
            icon={<AddIcon />}
            title="Creator"
          />
        </Link>
      ) : null}
      <Link to='/simple-asset'>
        <SVGIconButton
          variant='link'
          aria-label='Simple Asset'
          icon={<NFT />}
          title="Simple Asset"
        />
      </Link>
      <Link to='/simple-market'>
        <SVGIconButton
          variant='link'
          aria-label='Simple Market'
          icon={<NFT />}
          title="Simple Market"
        />
      </Link>
      {/* <Link to='/atomic-asset'>
        <SVGIconButton
          variant='link'
          aria-label='Atomic Asset'
          icon={<NFT />}
          title="Atomic Asset"
        />
      </Link>
      <Link to='/atomic-market'>
        <SVGIconButton
          variant='link'
          aria-label='Atomic Market'
          icon={<NFT />}
          title="Atomic Market"
        />
      </Link> */}
      <Link to='/store'>
        <SVGIconButton
          variant='link'
          aria-label='Store'
          icon={<Icon as={MdStorefront} />}
          title="Game Store"
        />
      </Link>
      <SVGIconButton
        variant='link'
        aria-label='Logout'
        title="Logout"
        icon={<Shutdown />}
        onClick={logout}
      />
    </VStack>
  )
}

export default Menu

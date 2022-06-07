import { IconButton, VStack } from '@chakra-ui/react'
import { useAnchor } from '@nice1/react-tools'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { ReactComponent as N1link } from '../icons/n1link.svg'
import { ReactComponent as Nft } from '../icons/nft.svg'
import { ReactComponent as Shutdown } from '../icons/shutdown.svg'
import { ReactComponent as User } from '../icons/user.svg'

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
          icon={<N1link />}
        />
      </Link>
      <Link to='/'>
        <SVGIconButton
          variant='link'
          aria-label='User profile'
          icon={<User />}
        />
      </Link>
      <Link to='/nfts'>
        <SVGIconButton
          variant='link'
          aria-label='Nft collection'
          icon={<Nft />}
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

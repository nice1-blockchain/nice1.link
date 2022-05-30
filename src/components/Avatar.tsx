import { Box, ImageProps } from "@chakra-ui/react"

import { ReactComponent as AvatarIcon } from '../icons/avatar.svg'
import { Image } from '../ipfs'

const Avatar = ({avatar, ...atrs}: {avatar: string | null} & ImageProps) => {
  let image = <AvatarIcon width='100%' height='100%' />
  if (avatar && avatar.length) {
    image =  <Image
      src={avatar as string}
      alt='avatar'
      maxH='100%'
      rounded='xl'
    />
  }

  return <Box {...atrs}>{image}</Box>
}

export default Avatar

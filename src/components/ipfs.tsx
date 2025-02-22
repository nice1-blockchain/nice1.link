import { Image as ChakraImage, ImageProps } from "@chakra-ui/react"


//const gateway = 'https://ipfs.io/ipfs/'
//const gateway = 'https://infura-ipfs.io/ipfs/'
const gateway = 'https://cloudflare-ipfs.com/ipfs/'


export const linkify = (link: string | undefined) => {
  if (typeof link === 'undefined') {
    return
  }

  if (link.indexOf('http') === 0) {
    return link
  }

  const matches = link.match(/(?:ipfs:\/\/)?(.*)/)

  if (!matches) {
    // no idea what we found, but get it back anyways (XSS issue maybe?)
    return link
  }

  const [, pin] = matches

  return gateway + pin
}

export const Image = ({src, ...props} : ImageProps) => {
  if (!src) {
    return null
  }

  const link = linkify(src)

  return <ChakraImage src={link} {...props} />
}

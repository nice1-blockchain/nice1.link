import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    bgs: {
      body: '#1A1E23',
      widgets: '#202938',
      gradientStart: '#260F09',
      gradientEnd: '#000',
      buttons: '#A61410',
    },
  },
  fonts: {
    body: 'Montserrat, sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'light',
      },
      variants: {
        login: {
          rounded: '20px',
          textTransform: 'uppercase',
          bg: 'bgs.buttons',
          _hover: {
            bg: 'red.900',
          },
        }
      },
    },
    Modal: {
      parts: ['dialog'],
      baseStyle: {
        dialog: {
          borderTop: '8px solid #C86266'
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'bgs.body',
      },
    },
  },
})

export default theme

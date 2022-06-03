import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  breakpoints: {
    // for unknown reasons, chakra does not include the xs breakpoint using object notation (but it does using array...)
    // adding it here fixes the issue tho
    xs: '0em',
    sm: '30em',
    md: '48em',
    lg: '62em',
    xl: '80em',
    '2xl': '96em',
  },
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
        },
        outline: {
          borderColor: '#E01F1F',
          fontWeight: 'bold',
        },
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
    Link: {
      baseStyle: {
        color: '#C86266',
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

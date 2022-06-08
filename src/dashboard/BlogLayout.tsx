import { Box, Grid, GridItem } from '@chakra-ui/react'
import { ReactNode } from 'react'
import Scrollbar from 'simplebar-react'
import Footer from './Footer'

import Menu from './Menu'

import 'simplebar/dist/simplebar.min.css'
import BlogSidebar from './BlogSidebar'

const BlogLayout = ({children} : {children: ReactNode}) => (
  <Grid
    templateAreas={{xs: `
      "sidebar content"
      "sidebar history"
      "sidebar footer"
    `,
    lg: `
      "sidebar content history"
      "sidebar footer footer"
    `,
  }}
    minH='100vh'
    height={{
      xs: '100%',
      lg: '100vh',
    }}
  >
    <GridItem
      bg='bgs.widgets'
      borderTopLeftRadius={20}
      w='4.4em'
      p={5}
      area='sidebar'
    >
      <Menu />
    </GridItem>
    <GridItem
      area='content'
      p={5}
      pr={{lg: 0}}
      minH='calc(100vh - 6em)'
      w={{
        xs: 'calc(100vw - 4.4em)',
        lg: 'calc(100vw - 25em - 6em)',
        xl: 'calc(100vw - 35em - 6em)',
      }}
      overflow='hidden'
    >
      <Box
        bgColor='bgs.widgets'
        borderRightRadius='xl'
        borderBottomLeftRadius='xl'
        pr={2}
        h='100%'
      >
        <Scrollbar style={{maxHeight: '100%', padding: 'var(--chakra-space-4)'}}>
          {children}
        </Scrollbar>
      </Box>
    </GridItem>
    <GridItem area='history' p={5} w={{xs: '100%', lg: '25em', xl: '35em'}}>
      <BlogSidebar />
    </GridItem>
    <GridItem area='footer' p={5} justifySelf='center' maxH='6em'>
      <Footer />
    </GridItem>
  </Grid>
)

export default BlogLayout

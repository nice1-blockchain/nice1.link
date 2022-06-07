import { Box, Grid, GridItem } from '@chakra-ui/react'
import { ReactNode } from 'react'
import Scrollbar from 'simplebar-react'
import Footer from './Footer'

import Menu from './Menu'

import 'simplebar/dist/simplebar.min.css'

const BlogLayout = ({children} : {children: ReactNode}) => (
  <Grid
    templateAreas={`
      "sidebar content history"
      "sidebar footer footer"
    `}
    height='100vh'
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
    <GridItem area='content' p={5} minH='calc(100vh - 6em)' w='calc(100vw - 20em - 6em - var(--chakra-space-5))' overflow='hidden'>
      <Box
        bgColor='bgs.widgets'
        borderRightRadius='xl'
        borderBottomLeftRadius='xl'
        h='100%'
      >
        <Scrollbar style={{maxHeight: '100%', padding: 'var(--chakra-space-4)'}}>
          {children}
        </Scrollbar>
      </Box>
    </GridItem>
    <GridItem area='history' p={5} w='20em'>
      Posts
    </GridItem>
    <GridItem area='footer' p={5} justifySelf='center' maxH='6em'>
      <Footer />
    </GridItem>
  </Grid>
)

export default BlogLayout

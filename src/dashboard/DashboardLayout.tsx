import { Grid, GridItem } from '@chakra-ui/react'
import { ReactNode } from 'react'
import Footer from './Footer'

import Menu from './Menu'

const DashboardLayout = ({children} : {children: ReactNode}) => (
  <Grid
    templateAreas={`
      "sidebar content"
      "sidebar footer"
    `}
    minH='100vh'
  >
    <GridItem
      bg='bgs.widgets'
      borderTopLeftRadius={20}
      w='4.4em'
      p={5}
      area='sidebar'
      minH='100vh'
      h='100%'
    >
      <Menu />
    </GridItem>
    <GridItem area='content' p={5} minH='calc(100vh - 6em)' w='calc(100vw - 4.4em - var(--chakra-space-5))'>
      {children}
    </GridItem>
    <GridItem area='footer' p={5} justifySelf='center' maxH='6em'>
      <Footer />
    </GridItem>
  </Grid>
)

export default DashboardLayout

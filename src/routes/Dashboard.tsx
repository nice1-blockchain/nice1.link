import { Grid, GridItem, Box } from '@chakra-ui/react'

import BalanceCard from '../profile/BalanceCard'
import ProfileCard from '../profile/ProfileCard'
import PostCard from '../components/PostCard'
import { NEWS_BASE_URL } from '../constants'
import { useBlog } from '../hooks/blog'
import { ProfileResourcesCard } from '../profile/ProfileResourcesCard'
// import { NftBalanceCard } from '../nfts/NftBalanceCard'
// import { ResourcesCard } from '../dashboard/ResourcesCard'


export default function Dashboard() {
  const { posts, featured } = useBlog()

  return (
    <>
      {/* Banner a ancho completo ARRIBA */}
      <Box mb={2}>
        <a href={featured?.link}>
          <img 
            src="https://nice1-blockchain.github.io/nice1-link-news//images/first-banner.png" 
            alt=""
            style={{ width: '100%', borderRadius: '8px' }}
          />
        </a>
      </Box>

      {/* Grid con ProfileCard, Balance, etc. */}
      <Grid gap={2} templateRows='repeat(1, 1fr)' templateColumns='repeat(4, 1fr)'>
        <GridItem colSpan={{xs: 4, lg: 1}} rowSpan={1}>
          <Grid gap={2} templateColumns='repeat(2, 1fr)'>
            <GridItem colSpan={{xs: 2, md: 1, lg: 2}} maxW='100%'>
              <ProfileCard />
            </GridItem>
            <GridItem colSpan={{xs: 2, md: 1, lg: 2}} display='flex' maxW='100%'>
              <BalanceCard />
            </GridItem>
            <GridItem colSpan={{ xs: 2, md: 1, lg: 2 }} display='flex' maxW='100%'>
              <ProfileResourcesCard />
            </GridItem>
          </Grid>
        </GridItem>
        {/* Aquí puedes poner otro contenido en las 3 columnas restantes si quieres */}
      </Grid>
      <Grid gap={2} templateRows='repeat(1, 1fr)' templateColumns='repeat(4, 1fr)' mt={2}>
        {
          posts.map((post, k) => (
            <GridItem colSpan={{xs: 4, md: 2, lg: 1}} rowSpan={1} key={k} display='flex'>
              <PostCard post={post} />
            </GridItem>
          ))
        }
      </Grid>
    </>
  )
}

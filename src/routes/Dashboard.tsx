import { Grid, GridItem } from '@chakra-ui/react'
import { useEffect } from 'react'

import BalanceCard from '../profile/BalanceCard'
import ProfileCard from '../profile/ProfileCard'
import PostCard from '../components/PostCard'
import { NEWS_BASE_URL } from '../constants'
import { useBlog } from '../hooks/blog'

export default function Dashboard() {
  const { load, indexed, featured } = useBlog()
  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <Grid gap={2} templateRows='repeat(1, 1fr)' templateColumns='repeat(4, 1fr)'>
        <GridItem colSpan={{xs: 4, lg: 1}} rowSpan={1}>
          <Grid gap={2} templateColumns='repeat(2, 1fr)'>
            <GridItem colSpan={{xs: 2, md: 1, lg: 2}} maxW='100%'>
              <ProfileCard />
            </GridItem>
            <GridItem colSpan={{xs: 2, md: 1, lg: 2}} display='flex' maxW='100%'>
              <BalanceCard />
            </GridItem>
          </Grid>
        </GridItem>
        <GridItem colSpan={{xs: 4, lg: 3}} rowSpan={1}>
          <a href={featured?.link}>
            <img src={`${NEWS_BASE_URL}/images/${featured?.image}`} alt='' />
          </a>
        </GridItem>
      </Grid>
      <Grid gap={2} templateRows='repeat(1, 1fr)' templateColumns='repeat(4, 1fr)' mt={2}>
        {
          Object.values(indexed).map((post, k) => (
            <GridItem colSpan={{xs: 4, md: 2, lg: 1}} rowSpan={1} key={k} display='flex'>
              <PostCard post={post} />
            </GridItem>
          ))
        }
      </Grid>
    </>
  )
}

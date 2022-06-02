import { Grid, GridItem } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import axios from 'axios'

import BalanceCard from '../profile/BalanceCard'
import ProfileCard from '../profile/ProfileCard'
import PostCard from '../components/PostCard'
import { NEWS_BASE_URL, NEWS_INDEX_URL, Post } from '../constants'

export default function Dashboard() {
  const [loaded, setLoaded] = useState<boolean>(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [featured, setFeatured] = useState<{image: string, link: string}>({
    image: '',
    link: '',
  })

  useEffect(() => {
    if (loaded) return

    (async () => {
      const result = await axios.get(NEWS_INDEX_URL)

      setLoaded(true)
      setPosts(result.data.posts)
      setFeatured(result.data.featured)
    })()

  }, [loaded])

  return (
    <>
      <Grid gap={2} templateRows='repeat(1, 1fr)' templateColumns='repeat(4, 1fr)'>
        <GridItem colSpan={1} rowSpan={1}>
          <Grid gap={2}>
            <ProfileCard />
            <BalanceCard />
          </Grid>
        </GridItem>
        <GridItem colSpan={3} rowSpan={1}>
          <a href={featured.link}>
            <img src={`${NEWS_BASE_URL}/images/${featured.image}`} alt='' />
          </a>
        </GridItem>
      </Grid>
      <Grid gap={2} templateRows='repeat(1, 1fr)' templateColumns='repeat(4, 1fr)' mt={2}>
        {
          posts.map((post, k) => (
            <GridItem colSpan={1} rowSpan={1} key={k}>
              <PostCard post={post} />
            </GridItem>
          ))
        }
      </Grid>
    </>
  )
}

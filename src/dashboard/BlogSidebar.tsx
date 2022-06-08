import { VStack } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import PostCard from '../components/PostCard'
import { useBlog } from '../hooks/blog'

const BlogSidebar = () => {
  const { slug } = useParams()
  const { load, posts } = useBlog()
  useEffect(() => {
    load()
  }, [load])

  return (
    <VStack gap={2}>
      {
        posts.map((post, k) => {
          if (slug === post.slug) return null
          return <PostCard key={k} post={post} />
        })
      }
    </VStack>
  )
}

export default BlogSidebar

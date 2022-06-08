import { VStack } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'

import PostCard from '../components/PostCard'
import { useBlog } from '../hooks/blog'

const BlogSidebar = () => {
  const { slug } = useParams()
  const { posts } = useBlog()

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

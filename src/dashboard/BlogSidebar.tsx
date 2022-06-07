import { VStack } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import PostCard from '../components/PostCard'
import { useBlog } from '../hooks/blog'

const BlogSidebar = () => {
  const { slug } = useParams()
  const { load, indexed } = useBlog()
  useEffect(() => {
    load()
  }, [load])

  return (
    <VStack gap={2}>
      {
        Object.values(indexed).map((post) => {
          if (slug === post.slug) return null
          return <PostCard post={post} />
        })
      }
    </VStack>
  )
}

export default BlogSidebar

import { Box, Heading, Image, Text } from '@chakra-ui/react'
import axios from 'axios'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useParams } from 'react-router-dom'
import remarkGfm from 'remark-gfm'
import styled from 'styled-components'

import { NEWS_BASE_URL, NEWS_INDEX_URL, Post } from '../constants'

export const StyledMarkdown = styled.div`
  text-align: left;
`

const PostPage = () => {
  const { slug } = useParams()
  const [ loaded, setLoaded ] = useState<boolean>(false)
  const [ markdown, setMarkdown ] = useState<string>('')
  const [ post, setPost ] = useState<Post>()

  useEffect(() => {
    if (loaded) return

    (async () => {
      try {
        const posts = await axios.get(NEWS_INDEX_URL)
        const post = posts.data.posts.find((post: Post) => post.slug === slug)
        const response = await axios.get(`${NEWS_BASE_URL}/posts/${post.file}`)

        setMarkdown(response.data)
        setPost(post)
      } catch (e) {
        console.error(e)
      }
      setLoaded(true)
    })()
  }, [loaded, markdown, slug])

  return (
    <Box>
      <Image src={`${NEWS_BASE_URL}/images/${post?.image}`} alt={`${post?.slug} heading image`}/>
      <StyledMarkdown>
        <ReactMarkdown
          children={markdown}
          remarkPlugins={[remarkGfm]}
          components={{
            h1({node, children, ...props}) {
              return <Heading size='md' mb={2} {...props}>{children}</Heading>
            },
            p({node, children, ...props}) {
              return <Text fontSize='sm'>{children}</Text>
            }
          }}
        />
      </StyledMarkdown>
    </Box>
  )
}

export default PostPage

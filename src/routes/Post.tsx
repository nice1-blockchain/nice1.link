import {
  Box,
  Button,
  HStack,
  IconButton,
  Image,
} from '@chakra-ui/react'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import Markdown from '../components/Markdown'

import { NEWS_BASE_URL } from '../constants'
import { IndexedPost, useBlog } from '../hooks/blog'
import { ArrowBack, Telegram, Twitter } from '../icons'

const SVGIconButton : typeof IconButton = styled(IconButton)`
  svg {
    width: 100%;
    height: 100%;
  }
  path {
    fill: var(--chakra-colors-gray-500);
    transition: all .3s;
  }

  svg:hover path {
    fill: var(--chakra-colors-gray-400);
  }
`

const PostPage = () => {
  const { slug } = useParams()
  const { load, loaded, posts } = useBlog()
  const [ post, setPost ] = useState<IndexedPost|null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!slug || !loaded) return

    try {
      const found = posts.find((post) => post.slug === slug)
      if (!found) {
        throw new Error('post not found')
      }

      setPost(found)
    } catch (e) {
      console.error(e)
    }

  }, [load, loaded, posts, slug])

  if (!post) return null // should show some kind of loading or similar.. waiting for design

  return (
    <Box>
      <Box mb={4}>
        <Box mb={4}>
          <Button variant='link' onClick={() => (window.history.state && window.history.state.idx && navigate(-1)) || navigate('/')} fontWeight='medium'>
            <ArrowBack style={{marginRight: 'var(--chakra-space-2)'}} /> Back
          </Button>
        </Box>
        <Box>
          <HStack color='gray.500' spacing={5} fontSize='xs'>
            <Box>
              {format(post.date, 'LLLL do, yyyy')}
            </Box>
            <Box>
              <SVGIconButton
                mr={2}
                height='15px'
                size='xss'
                variant='link'
                aria-label='Share on twitter'
                icon={<Twitter />}
                title='Share on twitter'
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${document.location.href}`, '_blank')}
              />
              <SVGIconButton
                height='15px'
                size='xss'
                variant='link'
                aria-label='Share on telegram'
                icon={<Telegram />}
                title='Share via Telegram'
                onClick={() => window.open(`https://t.me/share/url?url=${document.location.href}`, '_blank')}
              />
            </Box>
          </HStack>
        </Box>
      </Box>
      <Image src={`${NEWS_BASE_URL}/images/${post?.image}`} alt={`${post?.slug} heading image`}/>
      <Markdown contents={post?.contents} />
    </Box>
  )
}

export default PostPage

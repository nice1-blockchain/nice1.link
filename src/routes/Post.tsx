import {
  Box,
  Button,
  Code,
  Heading,
  HStack,
  IconButton,
  Image,
  Link as CLink,
  ListItem,
  OrderedList,
  Table,
  Text,
  Tr,
  UnorderedList,
} from '@chakra-ui/react'
import axios from 'axios'
import { format, parse } from 'date-fns'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import remarkGfm from 'remark-gfm'
import styled from 'styled-components'

import { NEWS_BASE_URL, NEWS_INDEX_URL, Post, StoredPost } from '../constants'
import { ArrowBack, Telegram, Twitter } from '../icons'

const StyledMarkdown = styled.div`
  text-align: left;
  .table, pre {
    overflow-x: auto;
    max-width: 100%;
    margin-bottom: var(--chakra-space-2);
  }
`

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
  const [ loaded, setLoaded ] = useState<boolean>(false)
  const [ loading, setLoading ] = useState<boolean>(false)
  const [ markdown, setMarkdown ] = useState<string>('')
  const [ post, setPost ] = useState<Post>()
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      if (loaded || loading) return
      setLoading(true)

      try {
        const posts = await axios.get(NEWS_INDEX_URL + '?' + (Math.random() * 1000))
        const found : StoredPost = posts.data.posts.find((post: StoredPost) => post.slug === slug)
        const response = await axios.get(`${NEWS_BASE_URL}/posts/${found.file}`)

        const post : Post = {
          ...found,
          date: parse(found.date as string, 'yyyy-MM-dd', new Date()),
        }

        setMarkdown(response.data)
        setPost(post)
      } catch (e) {
        console.error(e)
      }
      setLoaded(true)
      setLoading(false)
    })()
  }, [loaded, markdown, slug, loading])

  if (!post || loading || !loaded) {
    return null
  }

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
      <StyledMarkdown>
        <ReactMarkdown
          children={markdown}
          remarkPlugins={[remarkGfm]}
          components={{
            a({node, children, ...props}) {
              return <CLink {...props}>{children}</CLink>
            },
            h1({node, children, ...props}) {
              return <Heading size='lg' mt={5} mb={4} {...props}>{children}</Heading>
            },
            h2({node, children, ...props}) {
              return <Heading size='md' mt={5} mb={4} {...props}>{children}</Heading>
            },
            h3({node, children, ...props}) {
              return <Heading size='sm' mt={5} mb={4} {...props}>{children}</Heading>
            },
            ol({node, children, ...props}) {
              return <OrderedList {...props}>{children}</OrderedList>
            },
            ul({node, children, ...props}) {
              return <UnorderedList {...props}>{children}</UnorderedList>
            },
            li({node, children, ...props}) {
              return <ListItem {...props}>{children}</ListItem>
            },
            p({node, children, ...props}) {
              return <Text fontWeight='medium' mb={4}>{children}</Text>
            },
            table({node, children, ...props}) {
              return <div className='table'><Table {...props}>{children}</Table></div>
            },
            tr({node, children, ...props}) {
              return <Tr {...props}>{children}</Tr>
            },
            code({node, children, ...props}) {
              return <Code {...props}>{children}</Code>
            }
          }}
        />
      </StyledMarkdown>
    </Box>
  )
}

export default PostPage

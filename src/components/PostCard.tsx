import { Button, Heading, Image, Text } from '@chakra-ui/react'
import axios from 'axios'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'
import remarkgfm from 'remark-gfm'
import styled from 'styled-components'

import { NEWS_BASE_URL, Post } from '../constants'
import DashboardBox from './DashboardBox'

const wordsOverflow = (text: string, words: number) => {
  const parts = text.split(' ')

  return parts.splice(0, words).join(' ') + '...'
}

export const StyledMarkdown = styled.div`
  text-align: left;
  display: flex;
  flex-direction: column;
`
const PostCard = ({post}: {post: Post}) => {
  const [loaded, setLoaded] = useState<boolean>(false)
  const [markdown, setMarkdown] = useState<string>('')

  useEffect(() => {
    if (loaded) return

    (async() => {
      const response = await axios.get(`${NEWS_BASE_URL}/posts/${post.file}`)

      setMarkdown(response.data)
      setLoaded(true)
    })()
  }, [post.file, loaded])

  const image = <Image src={`${NEWS_BASE_URL}/images/${post.image}`} alt={`${post.slug} heading image`}/>

  return (
    <DashboardBox image={image} childProps={{h: '100%'}}>
      <StyledMarkdown>
        <ReactMarkdown
          children={wordsOverflow(markdown, 25)}
          remarkPlugins={[remarkgfm]}
          components={{
            table({children}) {
              return (
                <div className='table'>
                  {children}
                </div>
              )
            },
            h1({node, children, ...props}) {
              return <Heading size='md' mb={2} {...props}>{children}</Heading>
            },
            p({node, children, ...props}) {
              return <Text fontSize='sm'>{children}</Text>
            }
          }}
        />
        <Link to={`/blog/${post.slug}`} style={{alignSelf: 'end', marginTop: 'auto'}}>
          <Button variant='readmore' size='xs' alignSelf='flex-end' mt='auto'>
            Read more
          </Button>
        </Link>
      </StyledMarkdown>
    </DashboardBox>
  )
}

export default PostCard

import {
  Code,
  Heading,
  Link,
  ListItem,
  OrderedList,
  Table,
  Text,
  Tr,
  UnorderedList,
} from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styled from 'styled-components'

const StyledMarkdown = styled.div`
text-align: left;
.table, pre {
  overflow-x: auto;
  max-width: 100%;
  margin-bottom: var(--chakra-space-2);
}
`

const Markdown = ({contents}: {contents?: string}) => {
  if (!contents) {
    return null
  }

  return (
    <StyledMarkdown>
      <ReactMarkdown
        children={contents}
        remarkPlugins={[remarkGfm]}
        components={{
          a({node, children, ...props}) {
            return <Link {...props}>{children}</Link>
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
  )
}

export default Markdown

import axios from 'axios'
import { parse } from 'date-fns'
import { createContext, ReactNode, useContext, useState } from 'react'
import { NEWS_BASE_URL, NEWS_INDEX_URL } from '../constants'

export interface BasePost {
  file: string
  image: string
  slug: string
}

export interface Featured {
  link: string
  image: string
}

export type Post = BasePost & {
  date: Date
}

export type StoredPost = BasePost & {
  date: string
}

export type IndexedPost = Post & {
  contents: string
}

export type IndexedPosts = {
  [key: string]: IndexedPost
}

export interface BlogContext {
  error: Error | null
  featured: Featured | null
  load: () => void
  loaded: boolean
  loading: boolean
  indexed: IndexedPosts
  posts: Post[]
}

export const BlogContextInstance = createContext<BlogContext>({
  error: null,
  featured: null,
  load: () => {},
  loaded: false,
  loading: false,
  indexed: {},
  posts: [],
})

export const useBlog = () => {
  const blog = useContext(BlogContextInstance)

  return blog
}

export const BlogProvider = ({children}: {children: ReactNode}) => {
  const [ error, setError ] = useState<Error|null>(null)
  const [ featured, setFeatured ] = useState<Featured|null>(null)
  const [ loaded, setLoaded ] = useState<boolean>(false)
  const [ loading, setLoading ] = useState<boolean>(false)
  const [ indexed, setIndexed ] = useState<IndexedPosts>({})
  const [ posts, setPosts ] = useState<Post[]>([])

  const state = {
    error,
    featured,
    indexed,
    load: async () => {
      if (loaded || loading) return

      setLoading(true)
      try {
        const result = await axios.get(NEWS_INDEX_URL)
        const p = result.data.posts
        const ind : IndexedPosts = {}

        await p.forEach(async (post: StoredPost, k: number) => {
          const date = parse(post.date as string, 'yyyy-MM-dd', new Date())
          const update = {
            ...post,
            date,
          }
          p[k] = update

          const markdown = await axios.get(`${NEWS_BASE_URL}/posts/${post.file}`)
          ind[post.slug] = {
            ...update,
            contents: markdown.data,
          }

          setIndexed(ind)
        })

        setPosts(p)
        setFeatured(result.data.featured)
      } catch (e: any) {
        setError(e)
      }
      setLoaded(true)
      setLoading(false)
    },
    loaded,
    loading,
    posts,
  }

  return (
    <BlogContextInstance.Provider value={state}>
      {children}
    </BlogContextInstance.Provider>
  )
}

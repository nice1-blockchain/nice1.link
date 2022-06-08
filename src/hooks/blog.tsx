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

export interface BlogContext {
  error: Error | null
  featured: Featured | null
  load: () => void
  loaded: boolean
  loading: boolean
  posts: IndexedPost[]
}

export const BlogContextInstance = createContext<BlogContext>({
  error: null,
  featured: null,
  load: () => {},
  loaded: false,
  loading: false,
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
  const [ posts, setPosts ] = useState<IndexedPost[]>([])

  const state = {
    error,
    featured,
    load: async () => {
      if (loaded || loading) return

      setLoading(true)
      try {
        const result = await axios.get(NEWS_INDEX_URL)
        const p = result.data.posts

        for (const k in p as object[]) {
          const post = p[k]
          const date = parse(post.date as string, 'yyyy-MM-dd', new Date())
          const markdown = await axios.get(`${NEWS_BASE_URL}/posts/${post.file}`)
          const update = {
            ...post,
            date,
            contents: markdown.data,
          }
          p[k] = update
        }

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

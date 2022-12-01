import axios from 'axios'
import { parse } from 'date-fns'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
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
  loaded: boolean
  loading: boolean
  posts: IndexedPost[]
}

export const BlogContextInstance = createContext<BlogContext>({
  error: null,
  featured: null,
  loaded: false,
  loading: false,
  posts: [],
})

export const useBlog = () => {
  const blog = useContext(BlogContextInstance)

  return blog
}

const castStoredPosts = async (posts: StoredPost[]) : Promise<IndexedPost[]> => {
  let ip : IndexedPost[] = []

  for (const post of posts) {
    const date = parse(post.date as string, 'yyyy-MM-dd', new Date())
    const markdown = await axios.get(`${NEWS_BASE_URL}/posts/${post.file}`)
    ip.push({
      ...post,
      date,
      contents: markdown.data,
    })
  }

  return ip
}

export const BlogProvider = ({children}: {children: ReactNode}) => {
  const [ error, setError ] = useState<Error|null>(null)
  const [ featured, setFeatured ] = useState<Featured|null>(null)
  const [ loaded, setLoaded ] = useState<boolean>(false)
  const [ loading, setLoading ] = useState<boolean>(false)
  const [ posts, setPosts ] = useState<IndexedPost[]>([])

  useEffect(() => {
    (async () => {
      if (loaded || loading) return

      setLoading(true)
      try {
        const result = await axios.get(NEWS_INDEX_URL)
        const p : StoredPost[] = result.data.posts
        let ip = await castStoredPosts(p)

        // sort results by date (desc) and trim to only 4 results
        ip = ip.sort((a, b) => {
          if (a.date.getTime() < b.date.getTime()) {
            return 1
          }
          if (a.date.getTime() > b.date.getTime()) {
            return -1
          }
          return 0
        }).splice(0, 4)

        setPosts(ip)
        setFeatured(result.data.featured)
      } catch (e: any) {
        setError(e)
      }
      setLoaded(true)
      setLoading(false)
    })()
  }, [loaded, loading])

  const state = {
    error,
    featured,
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

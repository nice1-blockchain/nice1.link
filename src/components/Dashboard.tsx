import { useAnchor } from '@nice1/react-tools'

export default function Dashboard() {
  const { login, logout, session } = useAnchor()

  return (
    <>
      {
        session === null ?
          <button onClick={login}>Login</button> :
          <>
            <button onClick={logout}>logout</button>
          </>
      }
    </>
  )
}

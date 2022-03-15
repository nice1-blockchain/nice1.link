import { useAnchor } from '@nice1/react-tools'

import Login from './components/Login'
import Dashboard from './components/Dashboard'

export const App = () => {
  const { session } = useAnchor()

  return session === null ? <Login /> : <Dashboard />
}

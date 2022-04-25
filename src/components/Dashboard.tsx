import { useAnchor } from '@nice1/react-tools'
import ProfileCard from './ProfileCard'

export default function Dashboard() {
  const { session } = useAnchor()

  return (
    <>
      <ProfileCard />
      <p>Hello { session?.auth.actor.toString() } :)</p>
    </>
  )
}

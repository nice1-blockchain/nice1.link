import { Progress } from '@chakra-ui/react'
import { useAnchor } from '@nice1/react-tools'
import Decimal from 'decimal.js'
import DashboardBox from '../components/DashboardBox'

const ResourcesCard = () => {
  const { account } = useAnchor()

  const cpu = (new Decimal(account?.cpu_limit.used.toString() as string)).div(account?.cpu_limit.max.toString() as string).mul(100)
  const net = (new Decimal(account?.net_limit.used.toString() as string)).div(account?.net_limit.max.toString() as string).mul(100)
  const ram = (new Decimal(account?.ram_usage.toString() as string)).div(account?.ram_quota.toString() as string).mul(100)

  return (
    <DashboardBox flexDirection='column'>
      <div>CPU: <Progress colorScheme='green' value={cpu.toNumber()} /></div>
      <div>NET: <Progress colorScheme='blue' value={net.toNumber()} /></div>
      <div>RAM: <Progress colorScheme='red' value={ram.toNumber()} /></div>
    </DashboardBox>
  )
}

export default ResourcesCard

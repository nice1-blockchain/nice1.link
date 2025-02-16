import React from 'react'
import { Box, HStack, StackDivider, Text, CircularProgress, CircularProgressLabel, Progress, VStack } from '@chakra-ui/react'
import { useAnchor } from '@nice1/react-tools'
import DashboardBox from '../components/DashboardBox'
import Decimal from 'decimal.js'




export const ProfileResourcesCard = () => {

  const { account } = useAnchor()

  //const passKB = 1024
  const hundred = 100

  const perRamUsed = Math.round(account?.ram_usage.value.toNumber() * hundred / account?.ram_quota.value.toNumber())
  const perCpuUsed = Math.round(account?.cpu_limit.used.value.toNumber() * hundred / account?.cpu_limit.max.value.toNumber())
  const perNetUsed = Math.round(account?.net_limit.used.value.toNumber() * hundred / account?.net_limit.max.value.toNumber())



  return (

    <DashboardBox childProps={{ justifyContent: 'center' }} justifyContent='center' >
      <HStack divider={<StackDivider/>} align='stretch'>
        <Box display='flex' alignItems='center' flexDir='column' flex='2 auto' >
          <CircularProgress value={hundred - perRamUsed} color='green.400' fontWeight='bold'>
            <CircularProgressLabel>
              {hundred - perRamUsed}%
            </CircularProgressLabel>
          </CircularProgress>
          <Text fontSize='md' >
            RAM used: {perRamUsed}%
          </Text>
        </Box>
        <Box display='flex' alignItems='center' flexDir='column' flex='2 auto'>
          <CircularProgress value={hundred - perCpuUsed} color='blue.400' fontWeight='bold'>
            <CircularProgressLabel>
              {hundred - perCpuUsed}%
            </CircularProgressLabel>
          </CircularProgress>
          <Text fontSize='md'>
            CPU used: {perCpuUsed}%
          </Text>
        </Box>
        <Box display='flex' alignItems='center' flexDir='column' flex='2 auto'>
          <CircularProgress value={hundred - perNetUsed} color='red.400' fontWeight='bold'>
            <CircularProgressLabel>
              {hundred - perNetUsed}%
            </CircularProgressLabel>
          </CircularProgress>
          <Text fontSize='md'>
            NET used: {perNetUsed}%
          </Text>
        </Box>
      </HStack>
    </DashboardBox>
  )
}

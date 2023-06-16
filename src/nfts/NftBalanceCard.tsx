//import React from 'react'
import { Box, HStack, Text } from '@chakra-ui/react'

import { useNft } from '../hooks/Nfts'
import DashboardBox from '../components/DashboardBox'


export const NftBalanceCard = () => {

  const { nfts } = useNft()

  return (
    <DashboardBox childProps={{ justifyContent: 'center' }} justifyContent='center'>
      <HStack align='stretch'>
        <Box>
          <Text alignContent='left' fontSize='md'>NFTs: {nfts.length}</Text>
        </Box>
      </HStack>
    </DashboardBox>
  )
}




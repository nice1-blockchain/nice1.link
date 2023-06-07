//import React from 'react'
import { Box, HStack, Text } from '@chakra-ui/react'

import { useNftSimpleAssets } from '../hooks/NftsProvider'
import DashboardBox from '../components/DashboardBox'


export const NftBalance = () => {

  const { nfts } = useNftSimpleAssets()

  return (
    <DashboardBox childProps={{ justifyContent: 'center' }} justifyContent='center'>
      <HStack align='stretch'>
        <Box>
          <Text fontWeight='bold' fontSize='sm' color='gray.400'> NFTs: </Text>
        </Box>
        <Box>
          <Text fontWeight='bold' fontSize='md'>{nfts.length}</Text>
        </Box>
      </HStack>
    </DashboardBox>
  )
}


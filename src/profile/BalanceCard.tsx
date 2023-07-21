import { Box, HStack, StackDivider, Text } from '@chakra-ui/react'
import NumberFormat from 'react-number-format'
import styled from 'styled-components'

import { useAnchor, useNice1 } from '@nice1/react-tools'
import { useNftSimpleAssets } from '../hooks/NftSimpleAssets'

import DashboardBox from '../components/DashboardBox'
import { EOS, N1Token, NFT } from '../icons'

const SVGIcon : typeof Box  = styled(Box)`
  margin-right: var(--chakra-space-2);
  min-width: 25px;
  > svg {
    height: 100%;
    width: 100%;
  }
`

const BalanceCard = () => {
  const { account } = useAnchor()
  const { balance } = useNice1()
  const { nfts } = useNftSimpleAssets()



  return (
    <DashboardBox childProps={{justifyContent: 'center'}} justifyContent='center'>
      <HStack divider={<StackDivider />} align='stretch'>
        <Box flexDir='row' display='flex'>
          <SVGIcon>
            <N1Token />
          </SVGIcon>
          <Box>
            <Text fontSize='sm' color='gray.400'>
              NICEONE
            </Text>
            <Text fontWeight='bold' fontSize='md'>
              <NumberFormat
                value={balance.units.toString()}
                displayType='text'
                thousandSeparator
              />
            </Text>
          </Box>
        </Box>
        <Box flexDir='row' display='flex'>
          <SVGIcon>
            <EOS />
          </SVGIcon>
          <Box>
            <Text fontSize='sm' color='gray.400'>
              EOS
            </Text>
            <Text fontWeight='bold' fontSize='md'>
              <NumberFormat
                value={account?.core_liquid_balance?.toString()}
                displayType='text'
                thousandSeparator
                decimalScale={2}
              />
            </Text>
          </Box>
        </Box>
        <Box flexDir='row' display='flex'>
          <SVGIcon>
            <NFT />
          </SVGIcon>
          <Box>
            <Text fontSize='sm' color='gray.400'>
              NFTs
            </Text>
            <Text fontWeight='bold' fontSize='md'>
              <NumberFormat
                value={nfts.length.toString()}
                displayType='text'
              />
            </Text>
          </Box>
        </Box>
      </HStack>
    </DashboardBox>
  )
}

export default BalanceCard

import { useState } from 'react'
import { useAnchor } from '@nice1/react-tools'
import { useNftAtomicAssets } from '../../hooks/NftAtomicAssets'
import ProfileCard from '../../profile/ProfileCard'
import BalanceCard from '../../profile/BalanceCard'

import {
  Grid,
  GridItem,
  Box,
  Text,
  HStack,
  Image,
  VStack,
} from '@chakra-ui/react'


export interface TemplateBaseAtomicAssets {
  template_id: number | null
  schema_name: string | null
  transferable: string | null
  burnable: string | null
  max_supply: string | null
  issued_supply: string | null
  immutable_serialized_data: [] | null
}

export interface TemplateAtomicAssets {
  templateAA: TemplateBaseAtomicAssets[]
  updateTemplate: () => any
}



const NftCardAtomicAssets = () => {
  const { nftsAA } = useNftAtomicAssets()
  const { session } = useAnchor()
  const [templateAA, setTemplateAA] = useState<TemplateBaseAtomicAssets[]>([])
  const [templateAAInit, setTemplateAAInit] = useState<boolean>(false)




  const updateCollectionNameAA = async (nameCollect: any, idTemp: any) => {
    if (templateAAInit || session === null) {
      return
    }

    const { rows } = await session.client.v1.chain.get_table_rows({
      json: true,
      code: 'atomicassets',
      table: 'templates',
      scope: nameCollect,
      //lower_bound: idTemp, // Test for search optimisation...
      //upper_bound: idTemp,
      limit: 1000,
      reverse: false,
      show_payer: false,
    })
    const nft_rows = rows

    if (!nft_rows) {
      return
    }

    setTemplateAA(prevTemplateAA => [...prevTemplateAA, ...nft_rows]);
    setTemplateAAInit(true)

  }



  const searchMatchesInTempAA = (nameCollect: any, idTemp: any) => {

    updateCollectionNameAA(nameCollect, idTemp)

    const MatchesInTempAA = templateAA.find(listTemplateAA => listTemplateAA.template_id === idTemp);

    let immutableSerDatTemp
    //let schemaNameTemp

    const targetSequence = [81, 109]; // Sequence start url
    let sequenceFound = false
    let extractedAsciiString = ''
    let cadText = ''


    if (MatchesInTempAA) {
      immutableSerDatTemp = MatchesInTempAA.immutable_serialized_data
      // schemaNameTemp = MatchesInTempAA.schema_name
      // setTemplateTemp(schemaNameTemp)
      // setTemplateAAInit(true)
      for (let i = 0; i <= immutableSerDatTemp.length - targetSequence.length; i++) {
        if (immutableSerDatTemp.slice(i, i + targetSequence.length).every((value, index) => value === targetSequence[index])) {
          sequenceFound = true;
          extractedAsciiString = immutableSerDatTemp.slice(i, i + targetSequence.length + 44).join(' ');
          cadText = convertAsciiToText(extractedAsciiString)
          break;
        }
      }

    } else
      cadText = 'Immutable Serial Data No Found...'

    return cadText
  }


  const convertAsciiToText = (cadAscii) => {
    const asciiValues = cadAscii.split(' ');
    const urlText = 'https://cloudflare-ipfs.com/ipfs/' + asciiValues.map(value => String.fromCharCode(parseInt(value, 10))).join('');
    return urlText;
  };


  return (
    <>
      <HStack ml={-6} mt={-5} bg='bgs.widgets' justifyContent="flex-end">
        <Box ml={5}>
          <Text color='gray.400'>MY ATOMIC ASSETS ----</Text>
        </Box>
        <Box >
          <BalanceCard />
        </Box>
        <Box >
          <ProfileCard />
        </Box>
      </HStack>


      <Grid mt={5} gap={2} templateColumns='repeat(6, 1fr)' templateRows='repeat(1, 1fr)' >
        {
          nftsAA.map((nft, k) => (
            <GridItem key={k} className="custom-grid-item" bg='bgs.widgets' colSpan={1} rowSpan={1} mt={1} p={1} >
              <VStack alignItems='left'>
               <Box ml={5}>
                  <Image m={2} borderRadius={'30px'} objectFit={'cover'} src={searchMatchesInTempAA(nft.collection_name, nft.template_id)} />
                </Box>
                <Box ml={5}>
                  <Text fontSize='xs' color='gray.400'>Id: {nft.asset_id}</Text>
                </Box>
                <Box ml={5}>
                  <Text fontSize='xs' color='gray.400'>Collection: {nft.collection_name}</Text>
                </Box>
                <Box ml={5}>
                  <Text fontSize='xs' color='gray.400'>Template: {nft.template_id}</Text>
                </Box>
                <Box ml={5}>
                  <Text fontSize='xs' color='gray.400'>Category/Schema: {nft.schema_name}</Text>
                </Box>
              </VStack>
            </GridItem>
          ))
        }
      </Grid>
    </>
  )

}

export default NftCardAtomicAssets

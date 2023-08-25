import { useEffect, useState } from 'react'
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
  const [templateTemp, setTemplateTemp] = useState<string>('')


  // Update NFTs after any actions
  const updateTemplateAA = () => {
    setTemplateAAInit(false)
  }

  //get Template of atomicassets
  useEffect(() => {
    ; (async () => {
      if (templateAAInit || session === null) {
        return
      }

      const { rows } = await session.client.v1.chain.get_table_rows({
        json: true,
        code: 'atomicassets',
        table: 'templates',
        scope: 'pomelo',  // TODO WITH CHANGE WITH UPGRADEABLE COLLECTION
        limit: 1000,
        reverse: false,
        show_payer: false,
      })
        const nft_rows = rows

       if (!nft_rows) {
        return
      }

      setTemplateAA(nft_rows)
      setTemplateAAInit(true)

    })()
  }, [session, templateAAInit]) //



//   async function updateCollection(collect: string, id_templ: number) {
//     ; (async () => {
//       if (templateAAInit || session === null) {
//         return
//       }

//       const { rows } = await session.client.v1.chain.get_table_rows({
//         json: true,
//         code: 'atomicassets',
//         table: 'templates',
//         scope: collect, // Probar con  'pioter.ftw'  session.auth.actor
//         limit: 1000,
//         reverse: false,
//         show_payer: false,
//       })
//       const nft_rows = rows

//       if (!nft_rows) {
//         return
//       }

//       setTemplateAA(nft_rows)
//       setTemplateAAInit(true)

//     })()

//     return searchMatchesInTempAA(id_templ)
//  }


  const searchMatchesInTempAA = (idTemp: number | null) => {

    const MatchesInTempAA = templateAA.find(listNftsSASM => listNftsSASM.template_id === idTemp);

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
          <Text color='gray.400'>ATOMIC ASSETS ----</Text>
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
                {/* <Box ml={5}>
                  <Text fontSize='xs' color='gray.400'>{updateCollection(nft.collection_name, nft.template_id)}</Text>
                </Box> */}
                <Box ml={5}>
                  <Image m={2} borderRadius={'30px'} objectFit={'cover'} src={searchMatchesInTempAA(nft.template_id)} />
                </Box>
                <Box ml={5}>
                  <Text fontSize='xs' color='gray.400'>Id: {nft.asset_id}</Text>
                </Box>
                <Box ml={5}>
                  <Text fontSize='xs' color='gray.400'>Collection: {nft.collection_name}</Text>
                </Box>
                <Box ml={5}>
                  <Text fontSize='xs' color='gray.400'>Category: {nft.schema_name}</Text>
                </Box>
                <Box ml={5}>
                  <Text fontSize='xs' color='gray.400'>Template: {nft.template_id}</Text>
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

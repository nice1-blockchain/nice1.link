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
  transferable: boolean | null
  burnable: boolean | null
  max_supply: number | null
  issued_supply: number | null
  immutable_serialized_data: [] | null
}

export interface TemplateAtomicAssets {
  templateAA: TemplateBaseAtomicAssets[]
  updateTemplate: () => any
}


export interface SchemaBaseAtomicAssets {
  schema_name: string | null
  format: [{}] | null
}

export interface SchemaAtomicAssets {
  schemaAA: SchemaBaseAtomicAssets[]
  updateSchema: () => any
}



const NftCardAtomicAssets = () => {
  const { nftsAA } = useNftAtomicAssets()
  const { session } = useAnchor()

  const [templateAA, setTemplateAA] = useState<TemplateBaseAtomicAssets[]>([])
  const [templateAAInit, setTemplateAAInit] = useState<boolean>(false)

  //const [schemaAA, setSchemaAA] = useState<SchemaBaseAtomicAssets[]>([])
  const [schemaAA, setSchemaAA] = useState<SchemaBaseAtomicAssets[]>([])
  const [schemaAAInit, setSchemaAAInit] = useState<boolean>(false)



  const updateTemplateByCollection = async (nameCollect: any, idTemplate: any) => {
    if (templateAAInit || session === null) {
      return
    }

    const { rows } = await session.client.v1.chain.get_table_rows({
      json: true,
      code: 'atomicassets',
      table: 'templates',
      scope: nameCollect,
      key_type: "i64",
      lower_bound: idTemplate,
      upper_bound: idTemplate,
      limit: 1000,
      reverse: false,
      show_payer: false,
    })

    const nft_rows_Template = rows

    if (!nft_rows_Template) {
      return
    }

    setTemplateAA(prevTemplateAA => [...prevTemplateAA, ...nft_rows_Template]);
    //setTemplateAA(nft_rows_Template);
    setTemplateAAInit(true)

  }


  const updateSchemaByCollection = async (nameCollect: any, nameSchema: any) => {
    if (schemaAAInit || session === null) {
      return
    }

    const { rows } = await session.client.v1.chain.get_table_rows({
      json: true,
      code: 'atomicassets',
      table: 'schemas',
      scope: nameCollect,
      lower_bound: nameSchema,
      upper_bound: nameSchema,
      limit: 1000,
      reverse: false,
      show_payer: false,
    })
    const nft_rowSchema = rows

    if (!nft_rowSchema) {
      return
    }

    setSchemaAA(prevSchemaAA => [...prevSchemaAA, ...nft_rowSchema]);
    //setSchemaAA(nft_rowSchema);
    setSchemaAAInit(true)
  }


  const searchMatchesInTempAAImag = (nameCollect: any, idTemplate: any) => {  

    try {

      updateTemplateByCollection(nameCollect, idTemplate)
      const MatchesInTempAA = templateAA.find(listTemplateAA => listTemplateAA.template_id === idTemplate);
      let immutableSerDatTemp

      const targetSequence = [81, 109]; // Sequence start url
      let sequenceFound = false
      let extractedAsciiString = ''
      let cadText = ''

      if (MatchesInTempAA) {
        immutableSerDatTemp = MatchesInTempAA.immutable_serialized_data

        for (let i = 0; i <= immutableSerDatTemp.length - targetSequence.length; i++) {
          if (immutableSerDatTemp.slice(i, i + targetSequence.length).every((value, index) => value === targetSequence[index])) {
            sequenceFound = true;
            extractedAsciiString = immutableSerDatTemp.slice(i, i + targetSequence.length + 44).join(' ');
            cadText = convertAsciiToText(extractedAsciiString)
            break;
          }
        }
      } else {
          cadText = 'Immutable Serial Data No Found...'
        }

      return cadText

    } catch (error) {
        console.error('Error:', error);
      }
  }


  const convertAsciiToText = (cadAscii) => {
    const asciiValues = cadAscii.split(' ');
    const urlText = 'https://atomichub-ipfs.com/ipfs/' + asciiValues.map(value => String.fromCharCode(parseInt(value, 10))).join('');
    return urlText;
  };



  const searchMatchesInTempAAName = (nameCollect: any, nameSchema: any, idTemplate: any) => {

    try {
      updateTemplateByCollection(nameCollect, idTemplate,)
      const MatchesInTempAA = templateAA.find(listTemplateAA => listTemplateAA.template_id === idTemplate);
      const MatchesInTempAAClone = structuredClone(MatchesInTempAA)

      updateSchemaByCollection(nameCollect, nameSchema)
      const MatchesInShemaAA = schemaAA.find(listSchemaAA => listSchemaAA.schema_name === nameSchema);
      const MatchesInShemaAAClone = structuredClone(MatchesInShemaAA)

      let cadText = ''

      if (MatchesInTempAAClone && MatchesInShemaAAClone) {

        let immutableSerDatTemp
        immutableSerDatTemp = MatchesInTempAAClone.immutable_serialized_data

        let formatSchema
        formatSchema = MatchesInShemaAAClone.format

        cadText = deserializeSchemaName(immutableSerDatTemp, formatSchema)

      } else {
        cadText = 'Sin coincidencias....'
      }

      return cadText

    } catch (error) {
      console.error('Error:', error);
    }

  }


  function deserializeSchemaName(ascii: number[], schema: any[]): any {

    const result: any = {};
    let asciiIndex = 0;
    let urlImg = ''

    for (const field of schema) {
      const fieldName = field.name;
      const fieldType = field.type;

      if (fieldType === 'string') {
        if ( fieldName === 'name') {
          const indiceCampo = ascii[asciiIndex];
          const strLength = ascii[asciiIndex + 1];
          const strBytes = ascii.slice(asciiIndex + 2, asciiIndex + strLength + 2);
          const str = String.fromCharCode(...strBytes);
          asciiIndex += strLength + 2;
          result[fieldName] = str;
          return str
        }
      }
    }
    console.log(result)
    return urlImg;
  }


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
                  <Image m={2}
                    borderRadius={'30px'}
                    objectFit={'cover'}
                    src={searchMatchesInTempAAImag(nft.collection_name, nft.template_id)} />
                </Box>
                <Box ml={5}>
                  <Text fontSize='lg' color='gray.300'><strong>Name: {searchMatchesInTempAAName(nft.collection_name, nft.schema_name, nft.template_id)}</strong></Text>
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

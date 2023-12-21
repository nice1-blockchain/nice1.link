import { useState, useEffect } from 'react'
import { useAnchor } from '@nice1/react-tools'
import { NftBaseAtomicAssets } from '../../hooks/NftAtomicAssets'
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
  template_id: number //| null
  schema_name: string //| null
  transferable: boolean //| null
  burnable: boolean //| null
  max_supply: number //| null
  issued_supply: number //| null
  immutable_serialized_data: number[]
}

export interface TemplateAtomicAssets {
  templateAA: TemplateBaseAtomicAssets[]
  updateTemplate: () => any
}


export interface SchemaBaseAtomicAssets {
  schema_name: string //| null
  format: []
}

export interface SchemaAtomicAssets {
  schemaAA: SchemaBaseAtomicAssets[]
  updateSchema: () => any
}



const NftCardAtomicAssets = () => {

  const { session } = useAnchor()

  const [nftsAA, setNftsAA] = useState<NftBaseAtomicAssets[]>([])
  const [nftsAAInit, setNftsAAInit] = useState<boolean>(false)

  const [templateAA, setTemplateAA] = useState<TemplateBaseAtomicAssets[]>([])
  const [templateAAInit, setTemplateAAInit] = useState<boolean>(false)

  const [schemaAA, setSchemaAA] = useState<SchemaBaseAtomicAssets[]>([])
  const [schemaAAInit, setSchemaAAInit] = useState<boolean>(false)

  const [counterNFTs, setCounterNFTs] = useState<number>(0)



  useEffect(() => {
    ; (async () => {
      if (nftsAAInit || session === null) {
        return
      }

      const { rows } = await session.client.v1.chain.get_table_rows({
        json: true,
        code: 'atomicassets',
        table: 'assets',
        scope: session.auth.actor,
        limit: 1000,
        reverse: false,
        show_payer: false,
      })
      const nft_rows = rows

      if (!nft_rows) {
        return
      }

      setNftsAA(nft_rows)
      setNftsAAInit(true)
      setCounterNFTs(nft_rows.length)

    })()
  }, [session, nftsAAInit])



  useEffect(() => {

    const loadTemplatesAA = async () => {

      if (nftsAA.length > 0 && nftsAA.length === counterNFTs && nftsAAInit) {

          for (const item of nftsAA) {
            try {
              const templateImagTemp = await getTemplateImagFromAtomicAssets(item.collection_name, item.template_id)
            } catch (error) {
              console.error("Error in useEffect > loadTemplatesAAImg/is1Round : ", error);
            }
          }

        //}
      }
    }


    loadTemplatesAA();

  }, [nftsAA, templateAA, nftsAAInit, templateAAInit]);




  // ***************************  GET TEMPLATES ************************************************************
  async function getTemplateImagFromAtomicAssets(collection: string, templateId: any) {

    return new Promise((resolve, reject) => {
      updateSearchTemplateImag(collection, templateId)
        .then(response => {
          if (response) {
            resolve(response)
            setTemplateAA(prevTemplateAAImag => [...prevTemplateAAImag, ...response]);
          }
        })
        .catch(error => {
          reject(`Error in getTemplateImagFromAtomicAssets > updateSearchTemplateImag: ${error}`);
        })
        .finally(() => {
          setTemplateAAInit(true)
        })
    });
  }


  const updateSearchTemplateImag = async (collection: string, templateId: any) => {

    if (templateAAInit || session === null) {
      return
    }
    //await new Promise(resolve => setTimeout(resolve, 600));
    const { rows } = await session.client.v1.chain.get_table_rows({
      json: true,
      code: 'atomicassets',
      table: 'templates',
      scope: collection,
      key_type: "i64",
      lower_bound: templateId,
      upper_bound: templateId,
      limit: 1000,
      reverse: false,
      show_payer: false,
    })

    const nft_rows_TemplateAAImag = rows

    if (nft_rows_TemplateAAImag) {
      return nft_rows_TemplateAAImag
    }
  }


  // ***************************  GET SCHEMAS ************************************************************
  const updateSearchSchemaByCollection = async (nameCollect: string, nameSchema: any) => {

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

    const nft_row_Schema = rows

    if (!nft_row_Schema) {
      return
    }

    setSchemaAA(prevSchemaAA => [...prevSchemaAA, ...nft_row_Schema]);
    setSchemaAAInit(true)
  }


  // ***************************  GET NAMES ************************************************************
  const getNameTemplate = (asset_ids: any) => {

    let cadText

    if (nftsAA.length > 0) {
      const MatchesInAssetsAAImag = nftsAA.find(listAssetsAAImag => listAssetsAAImag.asset_id == asset_ids);

      if (MatchesInAssetsAAImag) {
        let collectionNameTemp = MatchesInAssetsAAImag.collection_name
        let templateIdNameTemp = MatchesInAssetsAAImag.template_id

        if (templateAA.length > 0) {
          const MatchesInTemplateAAImag = templateAA.find(listTemplateAAImag => listTemplateAAImag.template_id == templateIdNameTemp);

          if (MatchesInTemplateAAImag) {
            let immutableSerDatTemp = MatchesInTemplateAAImag.immutable_serialized_data
            let schemaTemp = MatchesInTemplateAAImag.schema_name

            updateSearchSchemaByCollection(collectionNameTemp, schemaTemp)
            const MatchesInSchemaAA = schemaAA.find(listSchemaAA => listSchemaAA.schema_name == schemaTemp);

            if (MatchesInSchemaAA) {
              let formatSchemaTemp = MatchesInSchemaAA.format
              cadText = deserializeSchemaName(immutableSerDatTemp, formatSchemaTemp)
            }
          }
        }
      }
    }
    return cadText
  }


  function deserializeSchemaName(ascii: number[], schema: any[]): any {

    const result: any = {};
    let asciiIndex = 0;
    let cadTex = 'by default....'

    for (const field of schema) {
      const fieldName = field.name;
      const fieldType = field.type;

      if (fieldType === 'string') {
        if (fieldName === 'name') {
          const indexField = ascii[asciiIndex];
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
    return cadTex;
  }



  // ***************************  GET IMAGS ************************************************************
  const getImagTemplate = (asset_ids: any) => {

    let cadText

    if (nftsAA.length > 0) {
      const MatchesInAssetsAAImag = nftsAA.find(listAssetsAAImag => listAssetsAAImag.asset_id == asset_ids);

      if (MatchesInAssetsAAImag) {
        //let collectionImagTemp = MatchesInAssetsAAImag.collection_name
        let templateIdImagTemp = MatchesInAssetsAAImag.template_id

        if (templateAA.length > 0) {
          const MatchesInTemplateAAImag = templateAA.find(listTemplateAAImag => listTemplateAAImag.template_id == templateIdImagTemp);

          if (MatchesInTemplateAAImag) {
            let immutableSerDatTemp
            const targetSequence = [81, 109]; // Sequence start url
            let sequenceFound = false
            let extractedAsciiString = ''
            immutableSerDatTemp = MatchesInTemplateAAImag.immutable_serialized_data

            for (let i = 0; i <= immutableSerDatTemp.length - targetSequence.length; i++) {
              if (immutableSerDatTemp.slice(i, i + targetSequence.length).every((value, index) => value === targetSequence[index])) {
                sequenceFound = true;
                extractedAsciiString = immutableSerDatTemp.slice(i, i + targetSequence.length + 44).join(' ');
                cadText = convertAsciiToText(extractedAsciiString)
                break;
              }
            }
          }
        }
      }
    }
    return cadText
  }


  const convertAsciiToText = (cadAscii: string) => {
    const asciiValues = cadAscii.split(' ');
    const urlText = 'https://atomichub-ipfs.com/ipfs/' + asciiValues.map(value => String.fromCharCode(parseInt(value, 10))).join('');
    return urlText;
  }


  const searchImg = (asset_id: any) => {
    if (nftsAA.length > 0 && templateAA.length > 0 && nftsAA.length === templateAA.length) {
      return getImagTemplate(asset_id)
    }
  }


  const searchName = (asset_id: any) => {
    if (nftsAA.length > 0 && templateAA.length > 0 && nftsAA.length === templateAA.length) {
      return getNameTemplate(asset_id)
    }
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



      <Grid ml={-5} mt={2} gap={2} templateColumns='repeat(6, 1fr)' templateRows='repeat(1, 1fr)' >
        {
          nftsAA.map((nft, k) => (
            <GridItem key={k} className="custom-grid-item" bg='bgs.widgets' colSpan={1} rowSpan={1} mt={1} ml={1} mr={1} p={1} >
              <VStack margin={'2'} alignItems='left'>
                <Box ml={5}>
                  <Image marginRight={2}
                    borderRadius={'30px'}
                    objectFit={'cover'}
                    src={searchImg(nft.asset_id)} />
                </Box>
                <Box ml={5}>
                  <Text fontSize='lg' color='gray.300'><strong>{searchName(nft.asset_id)}</strong></Text>
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

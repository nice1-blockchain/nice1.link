import { useState } from 'react'
import { useAnchor } from '@nice1/react-tools'
import { useNftAtomicMarket } from '../../hooks/NftAtomicMarket'
import { NftBaseAtomicAssets } from '../../hooks/NftAtomicAssets'
import { TemplateBaseAtomicAssets } from '../nftAtomicAssets/NftCardAtomicAssets'
import { SchemaBaseAtomicAssets } from '../nftAtomicAssets/NftCardAtomicAssets'
import { NftBuyConfModalAM  } from '../nftAtomicMarket/NftBuyConfModalAM'
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
  Button,
} from '@chakra-ui/react'




const NftCardAtomicMarket = () => {

  const { nftsAM } = useNftAtomicMarket()
  const { session } = useAnchor()

  const [ nftsAA, setNftsAA] = useState<NftBaseAtomicAssets[]>([])
  const [nftsAAInit, setNftsAAInit] = useState<boolean>(false)

  const [templateAA, setTemplateAA] = useState<TemplateBaseAtomicAssets[]>([])
  const [templateAAInit, setTemplateAAInit] = useState<boolean>(false)

  const [schemaAA, setSchemaAA] = useState<SchemaBaseAtomicAssets[]>([])
  const [schemaAAInit, setSchemaAAInit] = useState<boolean>(false)



  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(nftsAM.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = nftsAM.slice(startIndex, endIndex);

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    setCurrentPage(currentPage - 1);
  };





  const updateAssetsBySeller = async (seller: any, assetIds: any) => {
    if (nftsAAInit || session === null) {
      return
    }

    const { rows } = await session.client.v1.chain.get_table_rows({
      json: true,
      code: 'atomicassets',
      table: 'assets',
      scope: seller,
      key_type: "i64",
      lower_bound: assetIds,
      upper_bound: assetIds,
      limit: 1000,
      reverse: false,
      show_payer: false,
    })

    const nft_rows_AssetsAA = rows

    if (!nft_rows_AssetsAA) {
      return
    }

    setNftsAA(prevAssestAA => [...prevAssestAA, ...nft_rows_AssetsAA]);
    //setTemplateAA(nft_rows_AssetsAA);
    //setNftsAAInit(true)

  }



  const updateTemplateByAssetId = async (collection: any, templateId: any) => {
    if (templateAAInit || session === null) {
      return
    }

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

    const nft_rows_TemplateAA = rows

    if (!nft_rows_TemplateAA) {
      return
    }

    setTemplateAA(prevTemplateAA => [...prevTemplateAA, ...nft_rows_TemplateAA]);
    //setTemplateAA(nft_rows_TemplateAA);
    //setTemplateAAInit(true)
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




  const searchMatchesInAssetsImg = (seller: any, assetIds: any) => {

    let cadText = ''
    //let assetIds = parseInt(assetIdsArray[0]); // revisar.......arrary o string ?
    //alert(typeof (assetIdsArray))
    //let assetIds = parseInt(assetIdsArray[0])
    //alert(typeof (assetIds))


    try {

      updateAssetsBySeller(seller, assetIds)
      const MatchesInAssetsAA = nftsAA.find(listAssetsAA => listAssetsAA.asset_id == assetIds); // revisar...

      if (MatchesInAssetsAA) {
        let collectionTemp = MatchesInAssetsAA.collection_name
        let templateIdTemp = MatchesInAssetsAA.template_id

        updateTemplateByAssetId(collectionTemp, templateIdTemp)
        const MatchesInTemplateAA = templateAA.find(listTemplateAA => listTemplateAA.template_id == templateIdTemp); // revisar...

        if (MatchesInTemplateAA) {
          let immutableSerDatTemp
          const targetSequence = [81, 109]; // Sequence start url
          let sequenceFound = false
          let extractedAsciiString = ''
          immutableSerDatTemp = MatchesInTemplateAA.immutable_serialized_data

          for (let i = 0; i <= immutableSerDatTemp.length - targetSequence.length; i++) {
            if (immutableSerDatTemp.slice(i, i + targetSequence.length).every((value, index) => value === targetSequence[index])) {
              sequenceFound = true;
              extractedAsciiString = immutableSerDatTemp.slice(i, i + targetSequence.length + 44).join(' ');
              cadText = convertAsciiToText(extractedAsciiString)
              break;
            }
          }
        } else {
          cadText = 'MatchesInTemplateAA No Found...'
        }

      } else {
        cadText = 'MatchesInAssetsAA No Found...'
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



  const searchMatchesInAssetsName = (seller: any, assetIds: any) => {

    let cadText = ''


    try {

      updateAssetsBySeller(seller, assetIds)
      const MatchesInAssetsAA = nftsAA.find(listAssetsAA => listAssetsAA.asset_id == assetIds); // revisar...

      if (MatchesInAssetsAA) {

        let collectionTemp = MatchesInAssetsAA.collection_name
        let templateIdTemp = MatchesInAssetsAA.template_id



        updateTemplateByAssetId(collectionTemp, templateIdTemp)
        const MatchesInTemplateAA = templateAA.find(listTemplateAA => listTemplateAA.template_id == templateIdTemp); // revisar...


        if (MatchesInTemplateAA) {

          let immutableSerDatTemp = MatchesInTemplateAA.immutable_serialized_data
          let schemaTemp = MatchesInTemplateAA.schema_name


          updateSchemaByCollection(collectionTemp, schemaTemp)
          const MatchesInSchemaAA = schemaAA.find(listSchemaAA => listSchemaAA.schema_name == schemaTemp); // revisar...

          if (MatchesInSchemaAA) {

            let formatSchemaTemp = MatchesInSchemaAA.format
            cadText = deserializeSchemaName(immutableSerDatTemp, formatSchemaTemp)
          }

        } else {
          cadText = 'MatchesInTemplateAA No Found...'
        }

      } else {
        cadText = 'MatchesInAssetsAA No Found...'
      }

      return cadText

    } catch (error) {
      console.error('Error:', error);
    }
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



  return (

    <>
      <HStack ml={-6} mt={-5} bg='bgs.widgets' justifyContent="flex-end">
        <Box ml={5}>
          <Text fontSize='2xl' color='gray.400'>ATOMIC MARKET ----</Text>
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
              currentData.map((nft, k) => (
                <GridItem key={k} className="custom-grid-item" bg='bgs.widgets' colSpan={1} rowSpan={1} mt={1} p={1} >
                  <VStack alignItems='left'>
                    <Box ml={5}>
                      <Image m={2}
                        borderRadius={'30px'}
                        objectFit={'cover'}
                        src={searchMatchesInAssetsImg(nft.seller, nft.asset_ids)} />
                    </Box>
                    <Box ml={5}>
                      <Text fontSize='lg' color='gray.300'><strong>Name: {searchMatchesInAssetsName(nft.seller, nft.asset_ids)}</strong></Text>
                    </Box>
                    <Box ml={5}>
                      <Text fontSize='md' color='gray.400'>Id: {nft.asset_ids}</Text>
                    </Box>
                    <Box ml={5}>
                      <Text fontSize='md' color='gray.400'>Sale_id: {nft.sale_id}</Text>
                    </Box>
                    <Box ml={5}>
                      <Text fontSize='xl' color='gray.400'>Price: {nft.listing_price}</Text>
                    </Box>
                    <Box ml={5}>
                      <Text fontSize='xl' color='gray.400'>Collection: {nft.collection_name}</Text>
                    </Box>
                  </VStack>
                  <Box >
                    <NftBuyConfModalAM asset={nft} />
                  </Box>
                </GridItem>
              ))
            }
      </Grid>
      <Box ml={5}>
        <Button onClick={prevPage} disabled={currentPage === 0}>Previous</Button>
        <span> Page {currentPage + 1} of {totalPages} </span>
        <Button onClick={nextPage} disabled={currentPage === totalPages - 1}>Next</Button>
      </Box>

    </>
  )



}

export default NftCardAtomicMarket

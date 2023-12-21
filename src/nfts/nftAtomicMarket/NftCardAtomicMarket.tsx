import { useState, useEffect } from 'react'
import { useAnchor } from '@nice1/react-tools'
import { useNftAtomicMarket } from '../../hooks/NftAtomicMarket'
import { NftBaseAtomicAssets } from '../../hooks/NftAtomicAssets'
import { TemplateBaseAtomicAssets } from '../nftAtomicAssets/NftCardAtomicAssets'
import { SchemaBaseAtomicAssets } from '../nftAtomicAssets/NftCardAtomicAssets'
import { NftBuyConfModalAM } from './NftBuyConfModalAM'
import {
  Grid,
  GridItem,
  Box,
  Text,
  Image,
  VStack,
  Button,
} from '@chakra-ui/react'




const NftCardAtomicMarket = () => {

  const { nftsAM } = useNftAtomicMarket()
  const { session } = useAnchor()

  const [nftsAAImag, setNftsAAImag] = useState<NftBaseAtomicAssets[]>([])
  const [nftsAAImagInit, setNftsAAImagInit] = useState<boolean>(false)
  const [templateAAImag, setTemplateAAImag] = useState<TemplateBaseAtomicAssets[]>([])
  const [templateAAImagInit, setTemplateAAImagInit] = useState<boolean>(false)
  const [schemaAA, setSchemaAA] = useState<SchemaBaseAtomicAssets[]>([])
  const [schemaAAInit, setSchemaAAInit] = useState<boolean>(false)

  const [is1RoundTemplate, setIs1RoundTemplate] = useState<boolean>(true)
  const [counterNFTs, setCounterNFTs] = useState<number>(0)
  const [counterTemplates, setCounterTemplates] = useState<number>(0)
  const [disabledButtonNextPage, setDisabledButtonNextPage] = useState(true);
  const [disabledButtonPrevPage, setDisabledButtonPrevPage] = useState(false);

  let itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState<number>(0);
  const totalPages = Math.ceil(nftsAM.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = nftsAM.slice(startIndex, endIndex);

  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [imagesTotal, setImagesTotal] = useState(itemsPerPage);

  const templatEmpty: TemplateBaseAtomicAssets[] = [
    {
      template_id: -1,
      schema_name: 'Schema empty',
      transferable: false,
      burnable: false,
      max_supply: 0,
      issued_supply: 0,
      immutable_serialized_data: []
    }
  ];


  const handlerImageLoading = () => {

    setImagesLoaded(imagesLoaded + itemsPerPage);

    if (imagesLoaded === imagesTotal) {
      setDisabledButtonNextPage(false)
      //setDisabledButtonPrevPage(false)

    } else {
      setTimeout(() => {
        setDisabledButtonNextPage(false);
        //setDisabledButtonPrevPage(false)
      }, 1000);

    }
  }


  const nextPage = () => {
    setImagesLoaded(0);
    setDisabledButtonNextPage(true)

    setCurrentPage(currentPage + 1);
    setNftsAAImagInit(false)
    setTemplateAAImagInit(false)
  };

  const prevPage = () => {
    setImagesLoaded(0);
    setDisabledButtonPrevPage(true)

    setCurrentPage(currentPage - 1);
    //setNftsAAImagInit(false)
    //setTemplateAAImagInit(false)
  };



  useEffect(() => {

    const loadNftsAAImag = async () => {

      if (currentData.length > 0 && !nftsAAImagInit) {
        setCounterNFTs(counterNFTs + itemsPerPage);

        for (const item of currentData) {
          try {
            const assetImagTemp = await getAssetImagFromAtomicAssets(item.seller, item.asset_ids)
              .finally(() => {
                setNftsAAImagInit(true)
              })
          } catch (error) {
            console.error("Error in useEffect > loadNftsAAImag: ", error);
          }
        }
      }
    }


    const loadTemplatesAAImg = async () => {

      if (nftsAAImag.length === counterNFTs && nftsAAImagInit) {

        if (is1RoundTemplate) {
          setCounterTemplates(counterTemplates + itemsPerPage)

          for (const item of nftsAAImag) {
            try {
              const templateImagTemp = await getTemplateImagFromAtomicAssets(item.collection_name, item.template_id)
                .finally(() => {
                  setIs1RoundTemplate(false)
                })
            } catch (error) {
              console.error("Error in useEffect > loadTemplatesAAImg/is1Round : ", error);
            }
          }

        } else if (!is1RoundTemplate && !templateAAImagInit) {
          setCounterTemplates(counterTemplates + itemsPerPage)

            for (const item of nftsAAImag.slice(nftsAAImag.length - itemsPerPage)) {
              try {
                const templateImagTemp = await getTemplateImagFromAtomicAssets(item.collection_name, item.template_id)
                  .finally(() => {
                    setTemplateAAImagInit(true)
                  })
              } catch (error) {
                console.error("Error in useEffect > loadTemplatesAAImg/!is1Round : ", error);
              }
            }
        }
      }
    }


    loadNftsAAImag();
    loadTemplatesAAImg();

  }, [nftsAAImag, templateAAImag, nftsAAImagInit, templateAAImagInit, is1RoundTemplate, currentPage]);






// ***************************  GET ASSETS ************************************************************
  async function getAssetImagFromAtomicAssets(seller: string, assetIds: any) {

    return new Promise((resolve, reject) => {
      updateSearchAssetImag(seller, assetIds)
        .then(response => {
          if (response) {
            resolve(response)
            setNftsAAImag(prevNftsAAImag => [...prevNftsAAImag, ...response]);
          }
        })
        .catch(error => {
          reject(`Error in getAssetImagFromAtomicAssets > updateSearchAssetImag: ${error}`);
        })
        .finally(() => {
          setNftsAAImagInit(true)
        })
    });
  }

  const updateSearchAssetImag = async (seller: string, assetIds: any) => {

    if (nftsAAImagInit || session === null) {
      return
    }
    //await new Promise(resolve => setTimeout(resolve, 600));
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

    const nft_rows_AssetsAAImag = rows

    if (nft_rows_AssetsAAImag) {
      return nft_rows_AssetsAAImag
    }
  }



  // ***************************  GET TEMPLATES IMAG ************************************************************
  async function getTemplateImagFromAtomicAssets(collection: string, templateId: any) {

    return new Promise((resolve, reject) => {
      updateSearchTemplateImag(collection, templateId)
        .then(response => {
          if (response) {
            resolve(response)
            if (response.length === 0) {
              setTemplateAAImag(prevTemplateAAImag => [...prevTemplateAAImag, ...templatEmpty]);
            } else {
              setTemplateAAImag(prevTemplateAAImag => [...prevTemplateAAImag, ...response]);
            }
          }
        })
        .catch(error => {
          reject(`Error in getTemplateImagFromAtomicAssets > updateSearchTemplateImag: ${error}`);
        })
        .finally(() => {
          setTemplateAAImagInit(true)
        })
    });
  }


  const updateSearchTemplateImag = async (collection: string, templateId: any) => {

    if (templateAAImagInit || session === null) {
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

  async function getSchemaNameFromAtomicAssets(nameCollect: string, nameSchema: any) {

    return new Promise((resolve, reject) => {
      updateSearchSchemaByCollection(nameCollect, nameSchema)
        .then(response => {
          if (response) {
            resolve(response)
            setSchemaAA(prevSchemaAA => [...prevSchemaAA, ...response]);
          }
        })
        .catch(error => {
          reject(`Error in getSchemaNameFromAtomicAssets > updateSearchSchemaByCollection: ${error}`);
        })
        .finally(() => {
          setSchemaAAInit(true)
        })
    });
  }


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

    if (nft_row_Schema) {
      return nft_row_Schema
    }

    //setSchemaAA(prevSchemaAA => [...prevSchemaAA, ...nft_row_Schema]);
    //setSchemaAAInit(true)
  }



  // ***************************  GET NAMES ************************************************************
  const getNameTemplate = (asset_ids: any) => {

    let cadText

    if (nftsAAImag.length > 0) {
      const MatchesInAssetsAAImag = nftsAAImag.find(listAssetsAAImag => listAssetsAAImag.asset_id == asset_ids);

      if (MatchesInAssetsAAImag) {
        let collectionNameTemp = MatchesInAssetsAAImag.collection_name
        let templateIdNameTemp = MatchesInAssetsAAImag.template_id

        if (templateAAImag.length > 0) {
          const MatchesInTemplateAAImag = templateAAImag.find(listTemplateAAImag => listTemplateAAImag.template_id == templateIdNameTemp);

          if (MatchesInTemplateAAImag) {
            let immutableSerDatTemp = MatchesInTemplateAAImag.immutable_serialized_data
            let schemaTemp = MatchesInTemplateAAImag.schema_name

            getSchemaNameFromAtomicAssets(collectionNameTemp, schemaTemp)
            const MatchesInSchemaAA = schemaAA.find(listSchemaAA => listSchemaAA.schema_name == schemaTemp);

            if (MatchesInSchemaAA) {
              let formatSchemaTemp = MatchesInSchemaAA.format
              cadText = deserializeSchemaName(immutableSerDatTemp, formatSchemaTemp)
            } else {
              cadText = 'Name no found !!!'
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

    if (nftsAAImag.length > 0) {
      const MatchesInAssetsAAImag = nftsAAImag.find(listAssetsAAImag => listAssetsAAImag.asset_id == asset_ids);

      if (MatchesInAssetsAAImag) {
        let collectionImagTemp = MatchesInAssetsAAImag.collection_name
        let templateIdImagTemp = MatchesInAssetsAAImag.template_id

        if (templateAAImag.length > 0) {
          const MatchesInTemplateAAImag = templateAAImag.find(listTemplateAAImag => listTemplateAAImag.template_id == templateIdImagTemp);

          if (MatchesInTemplateAAImag) {
            if (MatchesInTemplateAAImag.template_id === -1) {
              cadText = `${process.env.PUBLIC_URL}/Nice1_NoPic.png`
            } else {
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
    }
    return cadText
  }


  const convertAsciiToText = (cadAscii: string) => {
    const asciiValues = cadAscii.split(' ');
    //const urlText = 'https://atomichub-ipfs.com/ipfs/' + asciiValues.map(value => String.fromCharCode(parseInt(value, 10))).join('');
    const urlText = 'https://cloudflare-ipfs.com/ipfs/' + asciiValues.map(value => String.fromCharCode(parseInt(value, 10))).join('');
    return urlText;
  }


  const searchImg = (asset_ids: any) => {
    if (nftsAAImag.length > 0 && templateAAImag.length > 0 && nftsAAImag.length === templateAAImag.length) {
      return getImagTemplate(asset_ids)
    }
  }


  const searchName = (asset_ids: any) => {
        if (nftsAAImag.length > 0 && templateAAImag.length > 0 && nftsAAImag.length === templateAAImag.length) {
      return getNameTemplate(asset_ids)
    }
  }




  return (
    <>

      <Grid mt={5} gap={2} templateColumns='repeat(6, 1fr)' templateRows='repeat(1, 1fr)' >
        {
          currentData.map((nft, k) => (
            <GridItem key={k} className="custom-grid-item" bg='bgs.widgets' colSpan={1} rowSpan={1} mt={1} p={1} >
              <VStack alignItems='left'>
                <Box ml={5}>
                  <Image m={2}
                    borderRadius={'30px'}
                    objectFit={'cover'}
                    src={searchImg(nft.asset_ids)}
                    onLoad={handlerImageLoading}/>
                </Box>
                <Box ml={5}>
                  <Text fontSize='lg' color='gray.300' ><strong>{searchName(nft.asset_ids)}</strong></Text>
                </Box>
                <Box ml={5}>
                  <Text fontSize='xs' color='gray.400'>Id: {nft.asset_ids}</Text>
                </Box>
                <Box ml={5}>
                  <Text fontSize='xs' color='gray.400'>Sale_id: {nft.sale_id}</Text>
                </Box>
                <Box ml={5}>
                  <Text fontSize='xs' color='gray.400'>Price: {nft.listing_price}</Text>
                </Box>
                <Box ml={5}>
                  <Text fontSize='xs' color='gray.400'>Collection: {nft.collection_name}</Text>
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
        <Button onClick={prevPage} disabled={currentPage === 0 || disabledButtonPrevPage}>Previous</Button>
        <span> Page {currentPage + 1} of {totalPages} </span>
        <Button onClick={nextPage} disabled={currentPage === totalPages - 1 || disabledButtonNextPage}>Next</Button>
      </Box>

    </>
  )
}

export default NftCardAtomicMarket

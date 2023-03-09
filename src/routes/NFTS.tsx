import { Grid, GridItem } from '@chakra-ui/react'

import { useNftSimpleAssets } from "../hooks/NftsProvider"


export default function Nfts() {
  const { nfts } = useNftSimpleAssets()

  return (
    <>
      {/*REVISAR MEJOR OPCION PARA PINTAR LOS DATOS - GRID ?*/}
      <Grid gap={2} templateRows='repeat(1, 1fr)' templateColumns='repeat(4, 1fr)' mt={2}>
        {
          nfts.map((nft, k) => (
            <GridItem colSpan={{ xs: 4, md: 2, lg: 1 }} rowSpan={1} key={k} display='flex'>
              - Owner: {nft.owner} <br />
              Id: {nft.id} <br />
              Author: {nft.author}<br />
              Category: {nft.category}
            </GridItem>
          ))
        }
      </Grid>
    </>
  )
}

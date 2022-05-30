import { Grid, GridItem } from '@chakra-ui/react'
import ProfileCard from '../profile/ProfileCard'
import ResourcesCard from '../dashboard/ResourcesCard'

export default function Dashboard() {
  return (
    <Grid gap={2}>
      <GridItem>
        <ProfileCard />
      </GridItem>
      <GridItem>
        <ResourcesCard />
      </GridItem>
    </Grid>
  )
}
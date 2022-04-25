import { Box } from "@chakra-ui/react"
import { useNice1 } from "@nice1/react-tools"
import { Image } from "../ipfs"

const ProfileCard = () => {
  const { profile } = useNice1()

  console.log(profile)

  return (
    <Box>
      <Image src={profile.avatar as string} alt={`${profile.alias} avatar`} />
    </Box>
  )
}

export default ProfileCard

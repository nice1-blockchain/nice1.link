import * as React from "react"
import {
  ChakraProvider,
  Box,
  VStack,
  Grid,
  theme,
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { Profile, useAnchor } from "@nice1/l1nk"

export const App = () => {
  const { login, logout, session } = useAnchor()

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <ColorModeSwitcher justifySelf="flex-end" />
          <VStack spacing={8}>
            {
              session === null ?
                <button onClick={login}>Login</button> :
                <>
                  <Profile />
                  <button onClick={logout}>logout</button>
                </>
              }
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  )
}
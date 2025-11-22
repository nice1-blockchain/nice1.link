import React from "react";
import { Box, Button, Heading, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const CreatorHome: React.FC = () => {
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const bg     = useColorModeValue("white", "gray.800");
  const nav    = useNavigate();

  return (
    <Box flex="1" p={{ base: 0, md: 2 }}>
      <Box bg={bg} borderWidth="1px" borderColor={border} rounded="lg" p={6} minH="200px">
        <Heading size="md" mb={4}>Acciones</Heading>

        <Stack direction={{ base: "column", md: "row" }} spacing={4}>
          <Box p={4} borderWidth="1px" borderColor={border} rounded="md" flex="1">
            <Heading size="sm" mb={2}>Create</Heading>
            <Text fontSize="sm" mb={3}>Crea una nueva License, Skin, Asset o Custom.</Text>
            <Button colorScheme="teal" onClick={() => nav("create")}>Ir a Create</Button>
          </Box>

          <Box p={4} borderWidth="1px" borderColor={border} rounded="md" flex="1">
            <Heading size="sm" mb={2}>Stock</Heading>
            <Text fontSize="sm" mb={3}>Ver y duplicar tus assets creados.</Text>
            <Button colorScheme="blue" onClick={() => nav("stock")}>Ir a Stock</Button>
          </Box>

          <Box p={4} borderWidth="1px" borderColor={border} rounded="md" flex="1" opacity={0.8}>
            <Heading size="sm" mb={2}>Modify</Heading>
            <Text fontSize="sm" mb={3}>Editar un activo existente (próximamente).</Text>
            <Button isDisabled>Próximamente</Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default CreatorHome;

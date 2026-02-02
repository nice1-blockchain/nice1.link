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
        <Heading size="md" mb={4}>Actions</Heading>

        <Stack direction={{ base: "column", md: "row" }} spacing={4}>
          <Box p={4} borderWidth="1px" borderColor={border} rounded="md" flex="1">
            <Heading size="sm" mb={2}>Create</Heading>
            <Text fontSize="sm" mb={3}>Create a new License, Skin, Asset, or Custom.</Text>
            <Button colorScheme="teal" onClick={() => nav("create")}>Go to Create</Button>
          </Box>

          <Box p={4} borderWidth="1px" borderColor={border} rounded="md" flex="1">
            <Heading size="sm" mb={2}>Stock</Heading>
            <Text fontSize="sm" mb={3}>View and duplicate your created assets.</Text>
            <Button colorScheme="blue" onClick={() => nav("stock")}>Go to Stock</Button>
          </Box>

          <Box p={4} borderWidth="1px" borderColor={border} rounded="md" flex="1" minW="200px">
            <Heading size="sm" mb={2}>En Venta</Heading>
            <Text fontSize="sm" mb={3}>Gestiona tus productos en venta y repone stock.</Text>
            <Button colorScheme="green" onClick={() => nav("sales")}>Ir a Ventas</Button>
          </Box>

          <Box p={4} borderWidth="1px" borderColor={border} rounded="md" flex="1" minW="200px">
            <Heading size="sm" mb={2}>Rent</Heading>
            <Text fontSize="sm" mb={3}>Manage your rental products and restock.</Text>
            <Button colorScheme="purple" onClick={() => nav("rentals")}>Go to Rentals</Button>
          </Box>

          {/* <Box p={4} borderWidth="1px" borderColor={border} rounded="md" flex="1" opacity={0.8}>
            <Heading size="sm" mb={2}>Modify</Heading>
            <Text fontSize="sm" mb={3}>Edit an existing asset (coming soon).</Text>
            <Button colorScheme="purple" onClick={() => nav("modify")}>Go to Modify</Button>
          </Box> */}
        </Stack>
      </Box>
    </Box>
  );
};

export default CreatorHome;

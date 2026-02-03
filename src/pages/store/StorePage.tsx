// src/pages/store/StorePage.tsx
import React from 'react';
import { Box, Heading, SimpleGrid, Spinner, Center, Text, Alert, AlertIcon } from '@chakra-ui/react';
import { useStore } from '../../hooks/useStore';
import StoreCard from '../../components/store/StoreCard';
import DashboardLayout from '../../dashboard/DashboardLayout';

const StorePage: React.FC = () => {
  const { storeItems, loading, error } = useStore();

  return (
    <DashboardLayout>
      <Box p={6}>
        <Heading size="lg" mb={6} color="white">Game Store</Heading>
        
        {loading ? (
          <Center h="300px"><Spinner size="xl" color="blue.500" /></Center>
        ) : error ? (
          <Alert status="error"><AlertIcon />{error}</Alert>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
            {storeItems.map((item) => (
              <StoreCard key={item.int_ref.toString()} item={item} />
            ))}
          </SimpleGrid>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default StorePage; // Asegúrate de esta línea
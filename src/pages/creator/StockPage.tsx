// src/pages/creator/StockPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
  Badge,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useStockContext, GroupedAsset } from '../../contexts/StockContext';
import AssetCard from '../../components/creator/AssetCard';
import DuplicateModal from '../../components/creator/DuplicateModal';
import BurnModal from '../../components/creator/BurnModal';
import { useNavigate } from 'react-router-dom';

const StockPage: React.FC = () => {
  const border = useColorModeValue('gray.200', 'whiteAlpha.200');
  const bg = useColorModeValue('white', 'gray.800');

  // Usar contexto compartido en lugar de useStock local
  const { groupedAssets, loading, error, reload, filterByCategory } = useStockContext();
  
  const [selectedAsset, setSelectedAsset] = useState<GroupedAsset | null>(null);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);

  const categories = [
    { name: 'Todas', value: null },
    { name: 'License', value: 'license' },
    { name: 'Skin', value: 'skin' },
    { name: 'Asset', value: 'asset' },
    { name: 'Custom', value: 'custom' },
  ];

  const handleAssetClick = (asset: GroupedAsset) => {
    setSelectedAsset(asset);
    setIsDuplicateModalOpen(true);
  };

  const handleDuplicateSuccess = async () => {
    setIsDuplicateModalOpen(false);
    setSelectedAsset(null);
    // Recargar assets después de duplicar (actualiza sidebar también)
    setTimeout(async () => await reload(), 1000);
  };

  const handleBurnSuccess = async () => {
    setIsBurnModalOpen(false);
    setSelectedAsset(null);
    // Recargar assets después de quemar
    setTimeout(async () => await reload(), 1000);
  };

  const getCategoryStats = (category: string | null) => {
    const filtered = filterByCategory(category);
    const totalAssets = filtered.reduce((sum, asset) => sum + asset.copyCount, 0);
    const uniqueAssets = filtered.length;
    return { totalAssets, uniqueAssets };
  };

  const nav = useNavigate();
  const toast = useToast();

  const handleModify = (asset: GroupedAsset) => {
    nav(`/creator/modify?id=${asset.ids[0]}`);
  };

  const handleDuplicate = (asset: GroupedAsset) => {
    setSelectedAsset(asset);
    setIsDuplicateModalOpen(true);
  };

  const handleBurn = (asset: GroupedAsset) => {
    setSelectedAsset(asset);
    setIsBurnModalOpen(true);
  };

  if (loading) {
    return (
      <Box flex="1" p={{ base: 0, md: 2 }}>
        <Box bg={bg} borderWidth="1px" borderColor={border} rounded="lg" p={6}>
          <Center minH="400px">
            <VStack spacing={4}>
              <Spinner size="xl" color="teal.500" thickness="4px" />
              <Text>Loading your assets...</Text>
            </VStack>
          </Center>
        </Box>
      </Box>
    );
  }

  return (
    <Box flex="1" p={{ base: 0, md: 2 }}>
      <Box bg={bg} borderWidth="1px" borderColor={border} rounded="lg" p={6}>
        <Heading size="md" mb={4}>
          Stock
        </Heading>

        {error && (
          <Alert status="error" mb={4} rounded="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!error && groupedAssets.length === 0 && (
          <Alert status="info" rounded="md">
            <AlertIcon />
            <AlertDescription>
              You don't have any assets created yet. Go to the Create section to create your first asset.
            </AlertDescription>
          </Alert>
        )}

        {groupedAssets.length > 0 && (
          <Tabs variant="soft-rounded" colorScheme="teal">
            <TabList mb={4} flexWrap="wrap">
              {categories.map((cat) => {
                const stats = getCategoryStats(cat.value);
                return (
                  <Tab key={cat.value || 'all'} fontSize="sm">
                    {cat.name}
                    {stats.uniqueAssets > 0 && (
                      <Badge ml={2} colorScheme="teal" fontSize="xs">
                        {stats.uniqueAssets}
                      </Badge>
                    )}
                  </Tab>
                );
              })}
            </TabList>

            <TabPanels>
              {categories.map((cat) => {
                const filtered = filterByCategory(cat.value);
                const stats = getCategoryStats(cat.value);

                return (
                  <TabPanel key={cat.value || 'all'} px={0}>
                    <Text fontSize="sm" mb={4} color="gray.500">
                      {stats.uniqueAssets} asset{stats.uniqueAssets !== 1 ? 's' : ''} único
                      {stats.uniqueAssets !== 1 ? 's' : ''} • {stats.totalAssets} unit
                      {stats.totalAssets !== 1 ? 's' : ''} en total
                    </Text>

                    {filtered.length === 0 ? (
                      <Center minH="200px">
                        <Text color="gray.500">
                          There are no assets in this category
                        </Text>
                      </Center>
                    ) : (
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
                        {filtered.map((asset, index) => (
                          <AssetCard
                            key={`${asset.name}-${asset.category}-${index}`}
                            asset={asset}
                            onClick={() => handleDuplicate(asset)}
                            onModify={handleModify}
                            onDuplicate={handleDuplicate}
                            onBurn={handleBurn}
                          />
                        ))}
                      </SimpleGrid>
                    )}
                  </TabPanel>
                );
              })}
            </TabPanels>
          </Tabs>
        )}
      </Box>

      {/* Modal de Duplicación */}
      {selectedAsset && (
        <DuplicateModal
          isOpen={isDuplicateModalOpen}
          onClose={() => {
            setIsDuplicateModalOpen(false);
            setSelectedAsset(null);
          }}
          asset={selectedAsset}
          onSuccess={handleDuplicateSuccess}
        />
      )}

      {/* Modal de Quemar */}
      {selectedAsset && (
        <BurnModal
          isOpen={isBurnModalOpen}
          onClose={() => {
            setIsBurnModalOpen(false);
            setSelectedAsset(null);
          }}
          asset={selectedAsset}
          onSuccess={handleBurnSuccess}
        />
      )}
    </Box>
  );
};

export default StockPage;
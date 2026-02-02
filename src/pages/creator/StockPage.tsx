// src/pages/creator/StockPage.tsx
// MODIFICADO: Integración con productos en venta
import React, { useState, useEffect } from 'react';
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
import { useSalesProducts, SaleProduct } from '../../hooks/useSalesProducts';
import AssetCard from '../../components/creator/AssetCard';
import DuplicateModal from '../../components/creator/DuplicateModal';
import BurnModal from '../../components/creator/BurnModal';
import SaleModal from '../../components/creator/SaleModal';
import ManageProductModal from '../../components/creator/ManageProductModal';
import RentalModal from '../../components/creator/RentalModal';
import { useNavigate } from 'react-router-dom';

const StockPage: React.FC = () => {
  const border = useColorModeValue('gray.200', 'whiteAlpha.200');
  const bg = useColorModeValue('white', 'gray.800');

  const { groupedAssets, loading, error, reload, filterByCategory } = useStockContext();
  const { products: saleProducts, reload: reloadSales, getProductByName } = useSalesProducts();
  
  const [selectedAsset, setSelectedAsset] = useState<GroupedAsset | null>(null);
  const [selectedSaleProduct, setSelectedSaleProduct] = useState<SaleProduct | null>(null);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);

  const categories = [
    { name: 'Todas', value: null },
    { name: 'License', value: 'license' },
    { name: 'Skin', value: 'skin' },
    { name: 'Asset', value: 'asset' },
    { name: 'Custom', value: 'custom' },
  ];

  const handleDuplicateSuccess = async () => {
    setIsDuplicateModalOpen(false);
    setSelectedAsset(null);
    setTimeout(async () => await reload(), 1000);
  };

  const handleBurnSuccess = async () => {
    setIsBurnModalOpen(false);
    setSelectedAsset(null);
    setTimeout(async () => await reload(), 1000);
  };

  const handleSaleSuccess = async () => {
    setIsSaleModalOpen(false);
    setSelectedAsset(null);
    // Recargar ambos: stock y productos en venta
    setTimeout(async () => {
      await reload();
      await reloadSales();
    }, 1000);
  };

  const handleManageSuccess = async () => {
    setIsManageModalOpen(false);
    setSelectedAsset(null);
    setSelectedSaleProduct(null);
    setTimeout(async () => {
      await reload();
      await reloadSales();
    }, 1000);
  };

   const handleRentalSuccess = async () => {
    setIsRentalModalOpen(false);
    setSelectedAsset(null);
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

  // Handler para abrir modal de venta (nuevo producto)
  const handleSale = (asset: GroupedAsset) => {
    if (asset.copyCount <= 1) {
      toast({
        title: 'No puedes vender este asset',
        description: 'Necesitas al menos 2 copias (1 referencia + 1 para vender)',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    setSelectedAsset(asset);
    setIsSaleModalOpen(true);
  };

  // NUEVO: Handler para alquiler
  const handleRental = (asset: GroupedAsset) => {
    if (asset.copyCount <= 1) {
      toast({
        title: 'No disponible',
        description: 'Necesitas más de 1 copia para poner en alquiler',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    setSelectedAsset(asset);
    setIsRentalModalOpen(true);
  };

  // Handler para gestionar producto ya en venta
  const handleManage = (asset: GroupedAsset) => {
    const saleProduct = getProductByName(asset.name);
    if (saleProduct) {
      setSelectedAsset(asset);
      setSelectedSaleProduct(saleProduct);
      setIsManageModalOpen(true);
    }
  };

  // Verificar si un asset está en venta
  const checkIsOnSale = (asset: GroupedAsset): boolean => {
    return !!getProductByName(asset.name);
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
                            onModify={handleModify}
                            onDuplicate={handleDuplicate}
                            onBurn={handleBurn}
                            onSale={handleSale}
                            onManage={handleManage}
                            isOnSale={checkIsOnSale(asset)}
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

      {/* Modal de Venta (nuevo producto) */}
      {selectedAsset && (
        <SaleModal
          isOpen={isSaleModalOpen}
          onClose={() => {
            setIsSaleModalOpen(false);
            setSelectedAsset(null);
          }}
          asset={selectedAsset}
          onSuccess={handleSaleSuccess}
        />
      )}

      {/* Modal de Gestión (producto ya en venta) */}
      {selectedAsset && selectedSaleProduct && (
        <ManageProductModal
          isOpen={isManageModalOpen}
          onClose={() => {
            setIsManageModalOpen(false);
            setSelectedAsset(null);
            setSelectedSaleProduct(null);
          }}
          asset={selectedAsset}
          saleProduct={selectedSaleProduct}
          onSuccess={handleManageSuccess}
        />
      )}

      {/* Modal Alquiler - NUEVO */}
      {selectedAsset && (
        <RentalModal
          isOpen={isRentalModalOpen}
          onClose={() => {
            setIsRentalModalOpen(false);
            setSelectedAsset(null);
          }}
          asset={selectedAsset}
          onSuccess={handleRentalSuccess}
        />
      )}
    </Box>
  );
};

export default StockPage;
// src/pages/creator/DemosPage.tsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  Image,
  Alert,
  AlertIcon,
  AlertDescription,
  Center,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react';
import { RepeatIcon, TimeIcon } from '@chakra-ui/icons';
import ActionsHeader from './ActionsHeader';
import { useDemoProducts, DemoProduct } from '../../hooks/useDemoProducts';
import { useStockContext, GroupedAsset } from '../../contexts/StockContext';
import RestockDemoModal from '../../components/creator/RestockDemoModal';
import SetDemoPeriodModal from '../../components/creator/SetDemoPeriodModal';

/**
 * Formatea segundos en texto legible
 */
const formatPeriod = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
  return `${(seconds / 86400).toFixed(1)}d`;
};

const getImageUrl = (img: string): string => {
  if (!img) return '/placeholder-image.png';
  if (img.startsWith('ipfs://')) {
    const cid = img.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${cid}`;
  }
  return img;
};

const DemosPage: React.FC = () => {
  const { products, loading, error, reload } = useDemoProducts();
  const { groupedAssets } = useStockContext();

  const { isOpen: isRestockOpen, onOpen: onRestockOpen, onClose: onRestockClose } = useDisclosure();
  const { isOpen: isPeriodOpen, onOpen: onPeriodOpen, onClose: onPeriodClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState<DemoProduct | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<GroupedAsset | null>(null);

  const findAssetForProduct = (product: DemoProduct): GroupedAsset | undefined => {
    return groupedAssets.find(
      (a) => a.name.toLowerCase() === product.product.toLowerCase()
    );
  };

  const handleRestock = (product: DemoProduct) => {
    const asset = findAssetForProduct(product);
    if (asset) {
      setSelectedProduct(product);
      setSelectedAsset(asset);
      onRestockOpen();
    }
  };

  const handleRestockSuccess = () => {
    onRestockClose();
    setSelectedProduct(null);
    setSelectedAsset(null);
    reload();
  };

  const handleSuccess = () => {
    onRestockClose();
    onPeriodClose();
    setSelectedProduct(null);
    setSelectedAsset(null);
    reload();
  };

  if (loading) {
    return (
      <Box>
        <ActionsHeader />
        <Center py={10}>
          <Spinner size="xl" color="cyan.500" />
        </Center>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <ActionsHeader />
        <Alert status="error" rounded="md">
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <ActionsHeader />
      <HStack justify="space-between" mb={6}>
        <Heading size="md">Demo Products</Heading>
        <Button
          size="sm"
          leftIcon={<RepeatIcon />}
          onClick={reload}
          isLoading={loading}
        >
          Refresh
        </Button>
      </HStack>

      {products.length === 0 && (
        <Alert status="info" rounded="md">
          <AlertIcon />
          <AlertDescription>
            You don't have any demo products.{' '}
            Go to Stock and select "Demo" on an asset with more than one copy.
          </AlertDescription>
        </Alert>
      )}

      {products.length > 0 && (
        <>
          <Text fontSize="sm" mb={4} color="gray.500">
            {products.length} demo product{products.length !== 1 ? 's' : ''}
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {products.map((product) => {
              const asset = findAssetForProduct(product);
              const availableStock = asset ? asset.copyCount - 1 : 0;

              return (
                <Card
                  key={product.int_ref}
                  borderWidth="1px"
                >
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      {asset && (
                        <Image
                          src={getImageUrl(asset.image)}
                          alt={product.product}
                          h="150px"
                          w="100%"
                          objectFit="cover"
                          rounded="md"
                          fallbackSrc="https://via.placeholder.com/300x150"
                        />
                      )}

                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" noOfLines={1}>
                          {product.product}
                        </Text>
                        <HStack>
                          <Badge colorScheme="cyan">Demo</Badge>
                          <Badge colorScheme="blue" variant="outline">
                            <HStack spacing={1}>
                              <TimeIcon boxSize={3} />
                              <Text>{formatPeriod(product.period)}</Text>
                            </HStack>
                          </Badge>
                        </HStack>
                      </VStack>

                      <VStack align="start" spacing={0} fontSize="sm" color="gray.500">
                        <Text>NFT Contract: {product.nftcontract}</Text>
                        <Text fontSize="xs" color="gray.400">
                          int_ref: {product.int_ref.toString()}
                        </Text>
                      </VStack>

                      {asset && (
                        <Alert
                          status={availableStock > 0 ? 'success' : 'warning'}
                          rounded="md"
                          py={2}
                          fontSize="sm"
                        >
                          <AlertIcon />
                          <Text>
                            {availableStock > 0
                              ? `${availableStock} available in stock`
                              : 'No stock available'}
                          </Text>
                        </Alert>
                      )}

                      {asset && availableStock > 0 && (
                        <Button
                          size="sm"
                          colorScheme="cyan"
                          leftIcon={<RepeatIcon />}
                          onClick={() => handleRestock(product)}
                        >
                          Restock
                        </Button>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>
        </>
      )}

      {/* Restock Modal - usa el mismo patrón que RestockRentalModal */}
      {selectedProduct && selectedAsset && (
        <RestockDemoModal
          isOpen={isRestockOpen}
          onClose={onRestockClose}
          asset={selectedAsset}
          demoProduct={selectedProduct}
          onSuccess={handleRestockSuccess}
        />
      )}

      {selectedProduct && (
        <SetDemoPeriodModal
          isOpen={isPeriodOpen}
          onClose={() => { onPeriodClose(); setSelectedProduct(null); }}
          product={selectedProduct}
          onSuccess={handleSuccess}
        />
      )}
    </Box>
  );
};

export default DemosPage;
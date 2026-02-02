// src/pages/creator/RentalsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  HStack,
  Image,
  Badge,
  Button,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { RepeatIcon, TimeIcon } from '@chakra-ui/icons';
import { useRentalProducts, RentalProduct } from '../../hooks/useRentalProducts';
import { useStockContext, GroupedAsset } from '../../contexts/StockContext';
import RestockRentalModal from '../../components/creator/RestockRentalModal';

const RentalsPage: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const border = useColorModeValue('gray.200', 'whiteAlpha.200');

  const { products, loading, error, reload } = useRentalProducts();
  const { groupedAssets } = useStockContext();

  const { isOpen: isRestockOpen, onOpen: onRestockOpen, onClose: onRestockClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState<RentalProduct | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<GroupedAsset | null>(null);

  useEffect(() => {
    reload();
  }, [reload]);

  const getImageUrl = (img: string): string => {
    if (!img) return '/placeholder-image.png';
    if (img.startsWith('ipfs://')) {
      const cid = img.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${cid}`;
    }
    return img;
  };

  const formatPeriod = (seconds: number): string => {
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h`;
    return `${Math.floor(seconds / 86400)} días`;
  };

  const findAssetForProduct = (product: RentalProduct): GroupedAsset | undefined => {
    return groupedAssets.find(
      (asset) => asset.name.toLowerCase() === product.product.toLowerCase()
    );
  };

  const handleRestock = (product: RentalProduct) => {
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

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" color="purple.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error" rounded="md">
        <AlertIcon />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="md">Productos en Alquiler</Heading>
        <Button
          size="sm"
          leftIcon={<RepeatIcon />}
          onClick={reload}
          isLoading={loading}
        >
          Actualizar
        </Button>
      </HStack>

      {products.length === 0 && (
        <Alert status="info" rounded="md">
          <AlertIcon />
          <AlertDescription>
            No tienes productos en alquiler.{' '}
            Ve a Stock y selecciona "Alquiler" en un asset con más de una copia.
          </AlertDescription>
        </Alert>
      )}

      {products.length > 0 && (
        <>
          <Text fontSize="sm" mb={4} color="gray.500">
            {products.length} producto{products.length !== 1 ? 's' : ''} en alquiler
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {products.map((product) => {
              const asset = findAssetForProduct(product);
              const availableStock = asset ? asset.copyCount - 1 : 0;

              return (
                <Card
                  key={product.int_ref}
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={border}
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
                          <Badge colorScheme="purple">En Alquiler</Badge>
                          <Badge colorScheme="blue" variant="outline">
                            <HStack spacing={1}>
                              <TimeIcon boxSize={3} />
                              <Text>{formatPeriod(product.period)}</Text>
                            </HStack>
                          </Badge>
                        </HStack>
                      </VStack>

                      <VStack align="start" spacing={0} fontSize="sm" color="gray.500">
                        <Text>Precio: <strong>{product.price}</strong></Text>
                        <Text>Receptor 1: {product.receiver1} ({product.percentr1}%)</Text>
                        {product.receiver2 && (
                          <Text>Receptor 2: {product.receiver2} ({product.percentr2}%)</Text>
                        )}
                        <Text>Redelegate: {product.redelegate ? 'Sí' : 'No'}</Text>
                        <Text fontSize="xs" color="gray.400">
                          int_ref: {product.int_ref.toString()}
                        </Text>
                      </VStack>

                      {asset && (
                        <Alert
                          status={availableStock > 0 ? 'info' : 'warning'}
                          rounded="md"
                          fontSize="xs"
                          py={2}
                        >
                          <AlertIcon boxSize={4} />
                          <Text>
                            {availableStock > 0
                              ? `${availableStock} unidad(es) disponibles para reponer`
                              : 'Sin stock disponible en wallet'}
                          </Text>
                        </Alert>
                      )}

                      <Button
                        size="sm"
                        colorScheme="purple"
                        leftIcon={<RepeatIcon />}
                        onClick={() => handleRestock(product)}
                        isDisabled={!asset || availableStock === 0}
                      >
                        Reponer Stock
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>
        </>
      )}

      {selectedProduct && selectedAsset && (
        <RestockRentalModal
          isOpen={isRestockOpen}
          onClose={() => {
            onRestockClose();
            setSelectedProduct(null);
            setSelectedAsset(null);
          }}
          asset={selectedAsset}
          rentalProduct={selectedProduct}
          onSuccess={handleRestockSuccess}
        />
      )}
    </Box>
  );
};

export default RentalsPage;
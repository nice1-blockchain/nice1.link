// src/pages/creator/SalesPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
  VStack,
  HStack,
  Badge,
  Image,
  Button,
  Card,
  CardBody,
  useDisclosure,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { useSalesProducts, SaleProduct } from '../../hooks/useSalesProducts';
import { useStockContext, GroupedAsset } from '../../contexts/StockContext';
import RestockModal from '../../components/creator/RestockModal';

const SalesPage: React.FC = () => {
  const border = useColorModeValue('gray.200', 'whiteAlpha.200');
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  const { products, loading, error, reload } = useSalesProducts();
  const { groupedAssets, reload: reloadStock } = useStockContext();

  const [selectedProduct, setSelectedProduct] = useState<SaleProduct | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<GroupedAsset | null>(null);
  
  const {
    isOpen: isRestockOpen,
    onOpen: onRestockOpen,
    onClose: onRestockClose,
  } = useDisclosure();

  /**
   * Buscar el asset agrupado que corresponde a un producto en venta
   * (por nombre del producto)
   */
  const findAssetForProduct = (product: SaleProduct): GroupedAsset | null => {
    return groupedAssets.find((a) => a.name === product.product) || null;
  };

  const handleRestock = (product: SaleProduct) => {
    const asset = findAssetForProduct(product);
    if (asset) {
      setSelectedProduct(product);
      setSelectedAsset(asset);
      onRestockOpen();
    }
  };

  const handleRestockSuccess = async () => {
    onRestockClose();
    setSelectedProduct(null);
    setSelectedAsset(null);
    // Recargar datos
    await reload();
    await reloadStock();
  };

  const getImageUrl = (img: string): string => {
    if (!img) return '/placeholder-image.png';
    if (img.startsWith('ipfs://')) {
      const cid = img.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${cid}`;
    }
    return img;
  };

  if (loading) {
    return (
      <Box flex="1" p={{ base: 0, md: 2 }}>
        <Box bg={bg} borderWidth="1px" borderColor={border} rounded="lg" p={6}>
          <Center minH="300px">
            <VStack spacing={4}>
              <Spinner size="xl" color="teal.500" thickness="4px" />
              <Text>Cargando productos en venta...</Text>
            </VStack>
          </Center>
        </Box>
      </Box>
    );
  }

  return (
    <Box flex="1" p={{ base: 0, md: 2 }}>
      <Box bg={bg} borderWidth="1px" borderColor={border} rounded="lg" p={6}>
        <HStack justify="space-between" mb={4}>
          <Heading size="md">En Venta</Heading>
          <Button
            size="sm"
            leftIcon={<RepeatIcon />}
            onClick={reload}
            variant="outline"
          >
            Actualizar
          </Button>
        </HStack>

        {error && (
          <Alert status="error" mb={4} rounded="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!error && products.length === 0 && (
          <Alert status="info" rounded="md">
            <AlertIcon />
            <AlertDescription>
              No tienes productos en venta. Ve a Stock y selecciona "Venta" en un asset con más de una copia.
            </AlertDescription>
          </Alert>
        )}

        {products.length > 0 && (
          <>
            <Text fontSize="sm" mb={4} color="gray.500">
              {products.length} producto{products.length !== 1 ? 's' : ''} en venta
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {products.map((product) => {
                const asset = findAssetForProduct(product);
                const availableStock = asset ? asset.copyCount - 1 : 0; // -1 por el NFT referencia

                return (
                  <Card
                    key={product.int_ref}
                    bg={cardBg}
                    borderWidth="1px"
                    borderColor={border}
                  >
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        {/* Imagen */}
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

                        {/* Info */}
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold" noOfLines={1}>
                            {product.product}
                          </Text>
                          <Badge colorScheme="green">En Venta</Badge>
                        </VStack>

                        {/* Detalles */}
                        <VStack align="start" spacing={0} fontSize="sm" color="gray.500">
                          <Text>Precio: <strong>{product.price}</strong></Text>
                          <Text>Receptor 1: {product.receiver1} ({product.percentr1}%)</Text>
                          {product.receiver2 && (
                            <Text>Receptor 2: {product.receiver2} ({product.percentr2}%)</Text>
                          )}
                          <Text fontSize="xs" color="gray.400">
                            int_ref: {product.int_ref}
                          </Text>
                        </VStack>

                        {/* Stock disponible en wallet */}
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

                        {/* Botón reponer */}
                        <Button
                          size="sm"
                          colorScheme="teal"
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
      </Box>

      {/* Modal de Reposición */}
      {selectedProduct && selectedAsset && (
        <RestockModal
          isOpen={isRestockOpen}
          onClose={() => {
            onRestockClose();
            setSelectedProduct(null);
            setSelectedAsset(null);
          }}
          asset={selectedAsset}
          saleProduct={selectedProduct}
          onSuccess={handleRestockSuccess}
        />
      )}
    </Box>
  );
};

export default SalesPage;
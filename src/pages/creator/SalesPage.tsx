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
  Switch,
  useToast,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import { RepeatIcon, EditIcon } from '@chakra-ui/icons';
import { FaPercentage } from 'react-icons/fa';
import { useSalesProducts, SaleProduct } from '../../hooks/useSalesProducts';
import { useStockContext, GroupedAsset } from '../../contexts/StockContext';
import { useSale } from '../../hooks/useSale';
import RestockModal from '../../components/creator/RestockModal';
import UpdatePriceModal from '../../components/creator/UpdatePriceModal';
import UpdatePercModal from '../../components/creator/UpdatePercModal';

const SalesPage: React.FC = () => {
  const border = useColorModeValue('gray.200', 'whiteAlpha.200');
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  const toast = useToast();
  const { products, loading, error, reload } = useSalesProducts();
  const { groupedAssets, reload: reloadStock } = useStockContext();
  const { toggleProduct, loading: toggleLoading } = useSale();

  const [selectedProduct, setSelectedProduct] = useState<SaleProduct | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<GroupedAsset | null>(null);
  const [togglingProduct, setTogglingProduct] = useState<number | null>(null);

  // Disclosures para modales
  const {
    isOpen: isRestockOpen,
    onOpen: onRestockOpen,
    onClose: onRestockClose,
  } = useDisclosure();

  const {
    isOpen: isPriceOpen,
    onOpen: onPriceOpen,
    onClose: onPriceClose,
  } = useDisclosure();

  const {
    isOpen: isPercOpen,
    onOpen: onPercOpen,
    onClose: onPercClose,
  } = useDisclosure();

  /**
   * Buscar el asset agrupado que corresponde a un producto en venta
   */
  const findAssetForProduct = (product: SaleProduct): GroupedAsset | null => {
    return groupedAssets.find((a) => a.name.toLowerCase() === product.product.toLowerCase()) || null;
  };

  // Handler: Toggle activar/desactivar
  const handleToggle = async (product: SaleProduct) => {
    const newActive = !(product.active !== false);
    setTogglingProduct(product.int_ref);

    const result = await toggleProduct(product.product, product.int_ref, newActive);

    setTogglingProduct(null);

    if (result.success) {
      toast({
        title: newActive ? 'Producto activado' : 'Producto desactivado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      await reload();
    } else {
      toast({
        title: 'Error al cambiar estado',
        description: result.error || 'Error desconocido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handler: Reponer stock
  const handleRestock = (product: SaleProduct) => {
    const asset = findAssetForProduct(product);
    if (asset) {
      setSelectedProduct(product);
      setSelectedAsset(asset);
      onRestockOpen();
    } else {
      toast({
        title: 'Asset no encontrado',
        description: 'No se encontró el asset en tu wallet',
        status: 'warning',
        duration: 3000,
      });
    }
  };

  // Handler: Cambiar precio
  const handleChangePrice = (product: SaleProduct) => {
    setSelectedProduct(product);
    onPriceOpen();
  };

  // Handler: Cambiar reparto
  const handleChangePerc = (product: SaleProduct) => {
    setSelectedProduct(product);
    onPercOpen();
  };

  // Callbacks de éxito
  const handleRestockSuccess = async () => {
    onRestockClose();
    setSelectedProduct(null);
    setSelectedAsset(null);
    await reload();
    await reloadStock();
  };

  const handlePriceSuccess = async () => {
    onPriceClose();
    setSelectedProduct(null);
    await reload();
  };

  const handlePercSuccess = async () => {
    onPercClose();
    setSelectedProduct(null);
    await reload();
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
                const availableStock = asset ? asset.copyCount - 1 : 0;
                const isActive = product.active !== false;
                const isToggling = togglingProduct === product.int_ref;

                return (
                  <Card
                    key={product.int_ref}
                    bg={cardBg}
                    borderWidth="2px"
                    borderColor={isActive ? 'green.400' : 'red.400'}
                    opacity={isActive ? 1 : 0.7}
                  >
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        {/* Header con Toggle */}
                        <HStack justify="space-between">
                          <Badge colorScheme={isActive ? 'green' : 'red'} fontSize="xs">
                            {isActive ? 'Activo' : 'Desactivado'}
                          </Badge>
                          <Tooltip label={isActive ? 'Desactivar venta' : 'Activar venta'}>
                            <Box>
                              <Switch
                                colorScheme={isActive ? 'green' : 'red'}
                                isChecked={isActive}
                                onChange={() => handleToggle(product)}
                                isDisabled={isToggling || toggleLoading}
                                size="md"
                              />
                            </Box>
                          </Tooltip>
                        </HStack>

                        {/* Imagen */}
                        {asset && (
                          <Image
                            src={getImageUrl(asset.image)}
                            alt={product.product}
                            h="120px"
                            w="100%"
                            objectFit="cover"
                            rounded="md"
                            fallbackSrc="https://via.placeholder.com/300x120"
                          />
                        )}

                        {/* Info */}
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold" noOfLines={1} fontSize="md">
                            {product.product}
                          </Text>
                        </VStack>

                        {/* Detalles */}
                        <VStack align="start" spacing={0} fontSize="sm" color="gray.500">
                          <Text>Precio: <strong>{product.price}</strong></Text>
                          <Text fontSize="xs">
                            {product.receiver1} ({product.percentr1}%)
                            {product.receiver2 && ` • ${product.receiver2} (${product.percentr2}%)`}
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            int_ref: {product.int_ref}
                          </Text>
                        </VStack>

                        {/* Stock disponible */}
                        {asset && (
                          <Alert
                            status={availableStock > 0 ? 'info' : 'warning'}
                            rounded="md"
                            fontSize="xs"
                            py={1}
                            px={2}
                          >
                            <AlertIcon boxSize={3} />
                            <Text>
                              {availableStock > 0
                                ? `${availableStock} disponible(s) para reponer`
                                : 'Sin stock en wallet'}
                            </Text>
                          </Alert>
                        )}

                        <Divider />

                        {/* Botones de acción */}
                        <VStack spacing={2}>
                          <Button
                            size="sm"
                            width="100%"
                            colorScheme="teal"
                            leftIcon={<RepeatIcon />}
                            onClick={() => handleRestock(product)}
                            isDisabled={!asset || availableStock === 0}
                          >
                            Reponer Stock
                          </Button>

                          <HStack width="100%" spacing={2}>
                            <Button
                              size="sm"
                              flex="1"
                              colorScheme="blue"
                              variant="outline"
                              leftIcon={<EditIcon />}
                              onClick={() => handleChangePrice(product)}
                            >
                              Precio
                            </Button>
                            <Button
                              size="sm"
                              flex="1"
                              colorScheme="purple"
                              variant="outline"
                              leftIcon={<FaPercentage />}
                              onClick={() => handleChangePerc(product)}
                            >
                              Reparto
                            </Button>
                          </HStack>
                        </VStack>
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

      {/* Modal de Cambiar Precio */}
      {selectedProduct && (
        <UpdatePriceModal
          isOpen={isPriceOpen}
          onClose={() => {
            onPriceClose();
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onSuccess={handlePriceSuccess}
        />
      )}

      {/* Modal de Cambiar Reparto */}
      {selectedProduct && (
        <UpdatePercModal
          isOpen={isPercOpen}
          onClose={() => {
            onPercClose();
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onSuccess={handlePercSuccess}
        />
      )}
    </Box>
  );
};

export default SalesPage;
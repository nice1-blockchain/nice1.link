// src/pages/creator/RentalsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Heading, Text, SimpleGrid, Card, CardBody, VStack, HStack, Image, Badge, Button,
  Spinner, Center, Alert, AlertIcon, AlertDescription, useColorModeValue, useDisclosure,
  Switch, useToast, Divider, IconButton, Tooltip,
} from '@chakra-ui/react';
import { RepeatIcon, TimeIcon, EditIcon } from '@chakra-ui/icons';
import { FaPercentage } from 'react-icons/fa';
import { useRentalProducts, RentalProduct } from '../../hooks/useRentalProducts';
import { useRentalActions } from '../../hooks/useRentalActions';
import { useStockContext, GroupedAsset } from '../../contexts/StockContext';
import RestockRentalModal from '../../components/creator/RestockRentalModal';
import UpdatePriceModal from '../../components/creator/UpdatePriceModal';
import UpdatePercModal from '../../components/creator/UpdatePercModal';
import ActionsHeader from './ActionsHeader';

const RentalsPage: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const border = useColorModeValue('gray.200', 'whiteAlpha.200');
  const toast = useToast();

  const { products, loading, error, reload } = useRentalProducts();
  const { toggleProduct, loading: toggleLoading } = useRentalActions();
  const { groupedAssets } = useStockContext();

  // Estado para modales
  const { isOpen: isRestockOpen, onOpen: onRestockOpen, onClose: onRestockClose } = useDisclosure();
  const { isOpen: isPriceOpen, onOpen: onPriceOpen, onClose: onPriceClose } = useDisclosure();
  const { isOpen: isPercOpen, onOpen: onPercOpen, onClose: onPercClose } = useDisclosure();

  const [selectedProduct, setSelectedProduct] = useState<RentalProduct | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<GroupedAsset | null>(null);

  // Track de toggles en progreso por int_ref
  const [togglingRefs, setTogglingRefs] = useState<Set<number>>(new Set());

  useEffect(() => { reload(); }, [reload]);

  const getImageUrl = (img: string): string => {
    if (!img) return '/placeholder-image.png';
    if (img.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${img.replace('ipfs://', '')}`;
    return img;
  };

  const formatPeriod = (seconds: number): string => {
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h`;
    return `${Math.floor(seconds / 86400)} days`;
  };

  const findAssetForProduct = (product: RentalProduct): GroupedAsset | undefined => {
    return groupedAssets.find((a) => a.name.toLowerCase() === product.product.toLowerCase());
  };

  // --- Handlers ---

  const handleToggle = async (product: RentalProduct) => {
    const newActive = !product.active;
    setTogglingRefs((prev) => new Set(prev).add(product.int_ref));

    const result = await toggleProduct(product.product, product.int_ref, newActive);
    
    setTogglingRefs((prev) => {
      const next = new Set(prev);
      next.delete(product.int_ref);
      return next;
    });

    if (result.success) {
      toast({
        title: newActive ? 'Alquiler activado' : 'Alquiler desactivado',
        status: newActive ? 'success' : 'info',
        duration: 2000,
      });
      reload();
    } else {
      toast({ title: 'Error', description: result.error, status: 'error', duration: 5000 });
    }
  };

  const handleRestock = (product: RentalProduct) => {
    const asset = findAssetForProduct(product);
    if (asset) {
      setSelectedProduct(product);
      setSelectedAsset(asset);
      onRestockOpen();
    }
  };

  const handleUpdatePrice = (product: RentalProduct) => {
    setSelectedProduct(product);
    onPriceOpen();
  };

  const handleUpdatePerc = (product: RentalProduct) => {
    setSelectedProduct(product);
    onPercOpen();
  };

  const handleSuccess = () => {
    onRestockClose();
    onPriceClose();
    onPercClose();
    setSelectedProduct(null);
    setSelectedAsset(null);
    reload();
  };

  if (loading) {
    return (
      <Box><ActionsHeader /><Center py={10}><Spinner size="xl" color="purple.500" /></Center></Box>
    );
  }

  if (error) {
    return (
      <Box><ActionsHeader /><Alert status="error" rounded="md"><AlertIcon /><AlertDescription>{error}</AlertDescription></Alert></Box>
    );
  }

  return (
    <Box>
      <ActionsHeader />
      <HStack justify="space-between" mb={6}>
        <Heading size="md">Rental Products</Heading>
        <Button size="sm" leftIcon={<RepeatIcon />} onClick={reload} isLoading={loading}>Refresh</Button>
      </HStack>

      {products.length === 0 && (
        <Alert status="info" rounded="md">
          <AlertIcon />
          <AlertDescription>
            You don't have any rental products. Go to Stock and select "Rent" on an asset with more than one copy.
          </AlertDescription>
        </Alert>
      )}

      {products.length > 0 && (
        <>
          <Text fontSize="sm" mb={4} color="gray.500">
            {products.length} product{products.length !== 1 ? 's' : ''} for rent
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {products.map((product) => {
              const asset = findAssetForProduct(product);
              const availableStock = asset ? asset.copyCount - 1 : 0;
              const isToggling = togglingRefs.has(product.int_ref);
              const isActive = product.active !== false; // default true si no existe el campo

              return (
                <Card
                  key={product.int_ref}
                  bg={cardBg}
                  borderWidth="2px"
                  borderColor={isActive ? 'green.400' : 'red.400'}
                  opacity={isActive ? 1 : 0.75}
                >
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      {/* Toggle activar/desactivar */}
                      <HStack justify="space-between">
                        <Badge colorScheme={isActive ? 'green' : 'red'} fontSize="xs">
                          {isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <HStack spacing={2}>
                          <Text fontSize="xs" color="gray.500">{isActive ? 'ON' : 'OFF'}</Text>
                          <Switch
                            size="md"
                            colorScheme="green"
                            isChecked={isActive}
                            onChange={() => handleToggle(product)}
                            isDisabled={isToggling}
                          />
                        </HStack>
                      </HStack>

                      {asset && (
                        <Image
                          src={getImageUrl(asset.image)}
                          alt={product.product}
                          h="150px" w="100%" objectFit="cover" rounded="md"
                          fallbackSrc="https://via.placeholder.com/300x150"
                        />
                      )}

                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" noOfLines={1}>{product.product}</Text>
                        <HStack>
                          <Badge colorScheme="purple">For Rent</Badge>
                          <Badge colorScheme="blue" variant="outline">
                            <HStack spacing={1}><TimeIcon boxSize={3} /><Text>{formatPeriod(product.period)}</Text></HStack>
                          </Badge>
                        </HStack>
                      </VStack>

                      <VStack align="start" spacing={0} fontSize="sm" color="gray.500">
                        <Text>Price: <strong>{product.price}</strong></Text>
                        <Text>Receiver 1: {product.receiver1} ({product.percentr1}%)</Text>
                        {product.receiver2 && (
                          <Text>Receiver 2: {product.receiver2} ({product.percentr2}%)</Text>
                        )}
                        <Text>Redelegate: {product.redelegate ? 'Yes' : 'No'}</Text>
                        <Text fontSize="xs" color="gray.400">int_ref: {product.int_ref.toString()}</Text>
                      </VStack>

                      {asset && (
                        <Alert
                          status={availableStock > 0 ? 'info' : 'warning'}
                          rounded="md" fontSize="xs" py={2}
                        >
                          <AlertIcon boxSize={4} />
                          <Text>
                            {availableStock > 0
                              ? `${availableStock} unit(s) available to restock`
                              : 'No stock available in wallet'}
                          </Text>
                        </Alert>
                      )}

                      <Divider />

                      {/* Botones de acción */}
                      <VStack spacing={2}>
                        <Button
                          size="sm" width="100%" colorScheme="purple"
                          leftIcon={<RepeatIcon />}
                          onClick={() => handleRestock(product)}
                          isDisabled={!asset || availableStock === 0}
                        >
                          Reponer Stock
                        </Button>
                        <HStack width="100%" spacing={2}>
                          <Button
                            size="sm" flex="1" colorScheme="blue" variant="outline"
                            leftIcon={<EditIcon />}
                            onClick={() => handleUpdatePrice(product)}
                          >
                            Precio
                          </Button>
                          <Button
                            size="sm" flex="1" colorScheme="orange" variant="outline"
                            leftIcon={<FaPercentage />}
                            onClick={() => handleUpdatePerc(product)}
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

      {/* Modales */}
      {selectedProduct && selectedAsset && (
        <RestockRentalModal
          isOpen={isRestockOpen}
          onClose={() => { onRestockClose(); setSelectedProduct(null); setSelectedAsset(null); }}
          asset={selectedAsset}
          rentalProduct={selectedProduct}
          onSuccess={handleSuccess}
        />
      )}

      {selectedProduct && (
        <UpdatePriceModal
          isOpen={isPriceOpen}
          onClose={() => { onPriceClose(); setSelectedProduct(null); }}
          product={selectedProduct}
          onSuccess={handleSuccess}
        />
      )}

      {selectedProduct && (
        <UpdatePercModal
          isOpen={isPercOpen}
          onClose={() => { onPercClose(); setSelectedProduct(null); }}
          product={selectedProduct}
          onSuccess={handleSuccess}
        />
      )}
    </Box>
  );
};

export default RentalsPage;
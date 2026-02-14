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

// --- NUEVAS IMPORTACIONES PARA EL STORE ---
import { useStore } from '../../hooks/useStore';
import { EditStoreInfoModal } from '../../components/creator/EditStoreInfoModal';
import ActionsHeader from './ActionsHeader';

const SalesPage: React.FC = () => {
  const border = useColorModeValue('gray.200', 'whiteAlpha.200');
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  const { products, loading, error, reload } = useSalesProducts();
  const { groupedAssets, reload: reloadStock } = useStockContext();

  // --- HOOKS PARA GESTIÓN DE TIENDA ---
  const { updateGameMetadata, storeItems } = useStore();
  const {
    isOpen: isEditStoreOpen,
    onOpen: onEditStoreOpen,
    onClose: onEditStoreClose,
  } = useDisclosure();

  const [selectedProduct, setSelectedProduct] = useState<SaleProduct | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<GroupedAsset | null>(null);
  
  const {
    isOpen: isRestockOpen,
    onOpen: onRestockOpen,
    onClose: onRestockClose,
  } = useDisclosure();

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
        <ActionsHeader />
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
      <ActionsHeader />
      <Box bg={bg} borderWidth="1px" borderColor={border} rounded="lg" p={6}>
        <HStack justify="space-between" mb={4}>
          <Heading size="md">On Sale</Heading>
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
                
                // Obtenemos metadatos actuales para este producto específico
                const currentStoreItem = storeItems.find(si => si.product === product.product);

                return (
                  <Card
                    key={product.int_ref.toString()}
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
                          <Badge colorScheme="green">On Sale</Badge>
                        </VStack>

                        <VStack align="start" spacing={0} fontSize="sm" color="gray.500">
                          <Text>Precio: <strong>{product.price}</strong></Text>
                          <Text fontSize="xs" color="gray.400">
                            int_ref: {product.int_ref.toString()}
                          </Text>
                        </VStack>

                        <VStack spacing={2} mt={2}>
                          {/* BOTÓN PARA EDITAR INFORMACIÓN DE LA TIENDA */}
                          <Button 
                            size="sm" 
                            w="100%"
                            variant="outline" 
                            colorScheme="blue"
                            onClick={() => {
                              setSelectedProduct(product);
                              onEditStoreOpen();
                            }}
                          >
                            Editar Info Store
                          </Button>

                          <Button
                            size="sm"
                            w="100%"
                            colorScheme="teal"
                            leftIcon={<RepeatIcon />}
                            onClick={() => handleRestock(product)}
                            isDisabled={!asset || availableStock === 0}
                          >
                            Reponer Stock
                          </Button>
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

      {/* MODAL DE EDICIÓN DE METADATOS EXTENDIDOS */}
      {selectedProduct && (
        <EditStoreInfoModal
          isOpen={isEditStoreOpen}
          onClose={onEditStoreClose}
          productName={selectedProduct.product}
          productOwner={selectedProduct.productowner}
          currentMetadata={
            storeItems.find(si => si.product === selectedProduct.product)?.metadata || {
              shortDescription: "",
              longDescription: "",
              previews: [],
              videoUrl: ""
            }
          }
          onSave={updateGameMetadata}
        />
      )}
    </Box>
  );
};

export default SalesPage;
// src/components/creator/RestockModal.tsx
import React, { useState, useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Image,
  Badge,
  FormControl,
  FormLabel,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { GroupedAsset } from '../../hooks/useStock';
import { useSale } from '../../hooks/useSale';
import { SaleProduct } from '../../hooks/useSalesProducts';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: GroupedAsset;
  saleProduct: SaleProduct; // Producto en venta con int_ref
  onSuccess: () => void;
}

const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  asset,
  saleProduct,
  onSuccess,
}) => {
  const toast = useToast();
  const { restockProduct, loading, error, clearError } = useSale();

  const [stockToSend, setStockToSend] = useState<number>(1);

  // IDs disponibles (excluyendo el ID más bajo que es la referencia)
  const sortedIds = useMemo(() => [...asset.ids].sort((a, b) => a - b), [asset.ids]);
  const referenceNftId = sortedIds[0];
  const availableIds = sortedIds.slice(1);
  const maxStock = availableIds.length;

  // IDs que se enviarán
  const idsToSend = useMemo(() => {
    return availableIds.slice(0, stockToSend);
  }, [availableIds, stockToSend]);

  const getImageUrl = (img: string): string => {
    if (!img) return '/placeholder-image.png';
    if (img.startsWith('ipfs://')) {
      const cid = img.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${cid}`;
    }
    return img;
  };

  const handleSubmit = async () => {
    if (stockToSend < 1) {
      toast({ title: 'Debes enviar al menos 1 unidad', status: 'warning', duration: 3000 });
      return;
    }

    const result = await restockProduct(idsToSend, saleProduct.int_ref);

    if (result.success) {
      toast({
        title: 'Stock repuesto',
        description: `Se han enviado ${stockToSend} unidad(es) a la venta.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onSuccess();
    } else {
      toast({
        title: 'Error al reponer stock',
        description: result.error || 'Error desconocido',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    if (!loading) {
      clearError();
      setStockToSend(1);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" closeOnOverlayClick={!loading}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Reponer Stock</ModalHeader>
        {!loading && <ModalCloseButton />}

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Info del producto */}
            <HStack spacing={4} p={3} bg="gray.50" rounded="md" _dark={{ bg: 'gray.700' }}>
              <Image
                src={getImageUrl(asset.image)}
                alt={asset.name}
                boxSize="80px"
                objectFit="cover"
                rounded="md"
                fallbackSrc="https://via.placeholder.com/80"
              />
              <VStack align="start" spacing={1} flex={1}>
                <Text fontWeight="bold">{saleProduct.product}</Text>
                <Badge colorScheme="green">En Venta</Badge>
                <Text fontSize="sm" color="gray.500">
                  Precio: {saleProduct.price}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  int_ref: {saleProduct.int_ref.toString()}
                </Text>
              </VStack>
            </HStack>

            <Alert status="info" rounded="md" fontSize="sm">
              <AlertIcon />
              <Text>
                Tienes <strong>{maxStock}</strong> unidad(es) disponibles en tu wallet para enviar.
                El NFT #{referenceNftId} (referencia) no se puede enviar.
              </Text>
            </Alert>

            {maxStock === 0 ? (
              <Alert status="warning" rounded="md">
                <AlertIcon />
                <Text>
                  No tienes unidades disponibles para reponer. Duplica más copias primero.
                </Text>
              </Alert>
            ) : (
              <FormControl isRequired>
                <FormLabel>Cantidad a enviar</FormLabel>
                <NumberInput
                  value={stockToSend}
                  onChange={(_, val) => setStockToSend(val || 1)}
                  min={1}
                  max={maxStock}
                  isDisabled={loading}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  IDs a enviar: {idsToSend.join(', ')}
                </FormHelperText>
              </FormControl>
            )}

            {error && (
              <Alert status="error" rounded="md">
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="teal"
            mr={3}
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Enviando..."
            isDisabled={maxStock === 0}
          >
            Enviar Stock ({stockToSend})
          </Button>
          <Button variant="ghost" onClick={handleClose} isDisabled={loading}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RestockModal;
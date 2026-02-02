// src/components/creator/RestockRentalModal.tsx
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
  Divider,
} from '@chakra-ui/react';
import { RepeatIcon, TimeIcon } from '@chakra-ui/icons';
import { GroupedAsset } from '../../hooks/useStock';
import { RentalProduct } from '../../hooks/useRentalProducts';
import { useRental } from '../../hooks/useRental';

interface RestockRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: GroupedAsset;
  rentalProduct: RentalProduct;
  onSuccess: () => void;
}

const RestockRentalModal: React.FC<RestockRentalModalProps> = ({
  isOpen,
  onClose,
  asset,
  rentalProduct,
  onSuccess,
}) => {
  const toast = useToast();
  const { restockRentalProduct, loading } = useRental();

  const [amount, setAmount] = useState<number>(1);

  // IDs disponibles (excluyendo el de referencia)
  const sortedIds = useMemo(() => [...asset.ids].sort((a, b) => a - b), [asset.ids]);
  const referenceNftId = sortedIds[0];
  const availableIds = sortedIds.slice(1);
  const maxStock = availableIds.length;

  const idsToSend = useMemo(() => {
    return availableIds.slice(0, amount);
  }, [availableIds, amount]);

  const getImageUrl = (img: string): string => {
    if (!img) return '/placeholder-image.png';
    if (img.startsWith('ipfs://')) {
      const cid = img.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${cid}`;
    }
    return img;
  };

  const formatPeriod = (seconds: number): string => {
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} horas`;
    return `${Math.floor(seconds / 86400)} días`;
  };

  const handleRestock = async () => {
    if (amount < 1 || idsToSend.length === 0) {
      toast({ title: 'Selecciona al menos 1 unidad', status: 'warning', duration: 3000 });
      return;
    }

    const result = await restockRentalProduct(idsToSend, rentalProduct.int_ref);

    if (result.success) {
      toast({
        title: 'Stock repuesto',
        description: `Se han enviado ${amount} unidad(es) al contrato de alquiler.`,
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
      setAmount(1);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" closeOnOverlayClick={!loading}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Reponer Stock de Alquiler</ModalHeader>
        {!loading && <ModalCloseButton />}

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Info del producto */}
            <HStack spacing={4} p={3} bg="gray.50" rounded="md" _dark={{ bg: 'gray.700' }}>
              <Image
                src={getImageUrl(asset.image)}
                alt={asset.name}
                boxSize="60px"
                objectFit="cover"
                rounded="md"
                fallbackSrc="https://via.placeholder.com/60"
              />
              <VStack align="start" spacing={0} flex={1}>
                <Text fontWeight="bold">{rentalProduct.product}</Text>
                <HStack>
                  <Badge colorScheme="purple">En Alquiler</Badge>
                  <Badge colorScheme="blue" variant="outline">
                    <HStack spacing={1}>
                      <TimeIcon boxSize={3} />
                      <Text>{formatPeriod(rentalProduct.period)}</Text>
                    </HStack>
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="gray.500">Precio: {rentalProduct.price}</Text>
              </VStack>
            </HStack>

            <Divider />

            <Alert status="info" rounded="md">
              <AlertIcon />
              <Text fontSize="sm">
                Stock disponible en wallet: <strong>{maxStock}</strong> unidad(es)
              </Text>
            </Alert>

            {maxStock === 0 ? (
              <Alert status="warning" rounded="md">
                <AlertIcon />
                <Text>No tienes más unidades disponibles para reponer.</Text>
              </Alert>
            ) : (
              <FormControl>
                <FormLabel>Cantidad a enviar</FormLabel>
                <NumberInput
                  value={amount}
                  onChange={(_, val) => setAmount(val || 1)}
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
                  IDs a enviar: {idsToSend.slice(0, 5).join(', ')}
                  {idsToSend.length > 5 && ` ... (+${idsToSend.length - 5} más)`}
                </FormHelperText>
              </FormControl>
            )}

            <Alert status="warning" rounded="md" fontSize="sm">
              <AlertIcon />
              <Text>
                Los NFTs se enviarán al contrato <strong>n1licenseren</strong> con memo: {rentalProduct.int_ref}
              </Text>
            </Alert>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleClose} isDisabled={loading}>
              Cancelar
            </Button>
            <Button
              colorScheme="purple"
              leftIcon={<RepeatIcon />}
              onClick={handleRestock}
              isLoading={loading}
              loadingText="Enviando..."
              isDisabled={maxStock === 0 || idsToSend.length === 0}
            >
              Enviar {amount} unidad(es)
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RestockRentalModal;
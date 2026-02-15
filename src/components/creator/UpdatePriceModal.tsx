// src/components/creator/UpdatePriceModal.tsx
import React, { useState } from 'react';
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
  Text,
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
import { useSale } from '../../hooks/useSale';
import { SaleProduct } from '../../hooks/useSalesProducts';

interface UpdatePriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: SaleProduct;
  onSuccess: () => void;
}

const UpdatePriceModal: React.FC<UpdatePriceModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const toast = useToast();
  const { updatePrice, loading, error, clearError } = useSale();

  // Extraer precio actual (formato "X.0000 NICEOFI")
  const currentPrice = parseFloat(product.price.split(' ')[0]) || 1;
  const [newPrice, setNewPrice] = useState<number>(currentPrice);

  const handleSubmit = async () => {
    if (newPrice <= 0) {
      toast({ title: 'El precio debe ser mayor a 0', status: 'warning', duration: 3000 });
      return;
    }

    const result = await updatePrice(product.product, product.int_ref, newPrice);

    if (result.success) {
      toast({
        title: 'Precio actualizado',
        description: `Nuevo precio: ${newPrice.toFixed(4)} NICEOFI`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onSuccess();
    } else {
      toast({
        title: 'Error al actualizar precio',
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
      setNewPrice(currentPrice);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" closeOnOverlayClick={!loading}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Cambiar Precio</ModalHeader>
        {!loading && <ModalCloseButton />}

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.500">
              Producto: <strong>{product.product}</strong>
            </Text>
            <Text fontSize="sm" color="gray.500">
              Precio actual: <strong>{product.price}</strong>
            </Text>

            <FormControl isRequired>
              <FormLabel>Nuevo precio (NICEOFI)</FormLabel>
              <NumberInput
                value={newPrice}
                onChange={(_, val) => setNewPrice(val || 0)}
                min={0.0001}
                step={0.1}
                precision={4}
                isDisabled={loading}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText>
                Se formateará como: {newPrice.toFixed(4)} NICEOFI
              </FormHelperText>
            </FormControl>

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
            colorScheme="blue"
            mr={3}
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Actualizando..."
          >
            Actualizar Precio
          </Button>
          <Button variant="ghost" onClick={handleClose} isDisabled={loading}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdatePriceModal;
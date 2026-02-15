// src/components/creator/UpdatePriceModal.tsx
import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, FormHelperText, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  useToast, HStack, Text, Badge, VStack,
} from '@chakra-ui/react';
import { RentalProduct } from '../../hooks/useRentalProducts';
import { useRentalActions } from '../../hooks/useRentalActions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: RentalProduct;
  onSuccess: () => void;
}

const UpdatePriceModal: React.FC<Props> = ({ isOpen, onClose, product, onSuccess }) => {
  const toast = useToast();
  const { updatePrice, loading } = useRentalActions();

  // Parsear precio actual (formato "X.XXXX NICEOFI")
  const currentPrice = parseFloat(product.price) || 0;
  const [newPrice, setNewPrice] = useState<number>(currentPrice);

  const handleSubmit = async () => {
    const result = await updatePrice(product.product, product.int_ref, newPrice);
    if (result.success) {
      toast({ title: 'Precio actualizado', status: 'success', duration: 3000 });
      onSuccess();
    } else {
      toast({ title: 'Error', description: result.error, status: 'error', duration: 5000 });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnOverlayClick={!loading}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack><Text>Cambiar Precio</Text><Badge colorScheme="purple">{product.product}</Badge></HStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={loading} />
        <ModalBody>
          <VStack spacing={4}>
            <Text fontSize="sm" color="gray.500">Precio actual: <strong>{product.price}</strong></Text>
            <FormControl isRequired>
              <FormLabel>Nuevo precio (NICEOFI)</FormLabel>
              <NumberInput value={newPrice} onChange={(_, v) => setNewPrice(v || 0)} min={0.0001} step={0.1} precision={4} isDisabled={loading}>
                <NumberInputField />
                <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
              </NumberInput>
              <FormHelperText>{newPrice.toFixed(4)} NICEOFI</FormHelperText>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose} isDisabled={loading}>Cancelar</Button>
            <Button colorScheme="purple" onClick={handleSubmit} isLoading={loading} isDisabled={newPrice <= 0}>
              Actualizar Precio
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdatePriceModal;

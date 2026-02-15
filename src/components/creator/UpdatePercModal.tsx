// src/components/creator/UpdatePercModal.tsx
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
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  Divider,
} from '@chakra-ui/react';
import { useSale } from '../../hooks/useSale';
import { SaleProduct } from '../../hooks/useSalesProducts';

interface UpdatePercModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: SaleProduct;
  onSuccess: () => void;
}

const UpdatePercModal: React.FC<UpdatePercModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const toast = useToast();
  const { updatePercentages, loading, error, clearError } = useSale();

  const [receiver1, setReceiver1] = useState(product.receiver1);
  const [percentr1, setPercentr1] = useState(product.percentr1);
  const [receiver2, setReceiver2] = useState(product.receiver2 || '');
  const [percentr2, setPercentr2] = useState(product.percentr2 || 0);

  const handleSubmit = async () => {
    if (!receiver1.trim()) {
      toast({ title: 'Receptor 1 es requerido', status: 'warning', duration: 3000 });
      return;
    }
    if (percentr1 < 1 || percentr1 > 100) {
      toast({ title: 'Porcentaje 1 debe estar entre 1 y 100', status: 'warning', duration: 3000 });
      return;
    }
    if (receiver2.trim() && (percentr1 + percentr2 > 100)) {
      toast({ title: 'La suma de porcentajes no puede superar 100', status: 'warning', duration: 3000 });
      return;
    }

    const result = await updatePercentages(
      product.product,
      product.int_ref,
      receiver1.trim(),
      percentr1,
      receiver2.trim(),
      percentr2
    );

    if (result.success) {
      toast({
        title: 'Reparto actualizado',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onSuccess();
    } else {
      toast({
        title: 'Error al actualizar reparto',
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
      setReceiver1(product.receiver1);
      setPercentr1(product.percentr1);
      setReceiver2(product.receiver2 || '');
      setPercentr2(product.percentr2 || 0);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" closeOnOverlayClick={!loading}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Cambiar Reparto</ModalHeader>
        {!loading && <ModalCloseButton />}

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.500">
              Producto: <strong>{product.product}</strong>
            </Text>
            <Text fontSize="sm" color="gray.500">
              Reparto actual: {product.receiver1} ({product.percentr1}%)
              {product.receiver2 && `, ${product.receiver2} (${product.percentr2}%)`}
            </Text>

            <Divider />

            <FormControl isRequired>
              <FormLabel>Receptor 1 (cuenta WAX)</FormLabel>
              <Input
                value={receiver1}
                onChange={(e) => setReceiver1(e.target.value)}
                placeholder="cuenta.wam"
                isDisabled={loading}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Porcentaje receptor 1</FormLabel>
              <NumberInput
                value={percentr1}
                onChange={(_, val) => setPercentr1(val || 0)}
                min={1}
                max={100}
                isDisabled={loading}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText>Solo números enteros</FormHelperText>
            </FormControl>

            <Divider />

            <FormControl>
              <FormLabel>Receptor 2 (opcional)</FormLabel>
              <Input
                value={receiver2}
                onChange={(e) => setReceiver2(e.target.value)}
                placeholder="cuenta.wam"
                isDisabled={loading}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Porcentaje receptor 2</FormLabel>
              <NumberInput
                value={percentr2}
                onChange={(_, val) => setPercentr2(val || 0)}
                min={0}
                max={100 - percentr1}
                isDisabled={loading}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText>
                Dejar en 0 y receptor vacío si no hay segundo receptor
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
            Actualizar Reparto
          </Button>
          <Button variant="ghost" onClick={handleClose} isDisabled={loading}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdatePercModal;
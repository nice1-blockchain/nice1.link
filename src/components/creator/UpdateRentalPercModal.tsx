// src/components/creator/UpdatePercModal.tsx
import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, Input, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  useToast, HStack, Text, Badge, VStack, Checkbox, Divider, Alert, AlertIcon,
} from '@chakra-ui/react';
import { RentalProduct } from '../../hooks/useRentalProducts';
import { useRentalActions } from '../../hooks/useRentalActions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: RentalProduct;
  onSuccess: () => void;
}

const UpdatePercModal: React.FC<Props> = ({ isOpen, onClose, product, onSuccess }) => {
  const toast = useToast();
  const { updatePercentages, loading } = useRentalActions();

  const [receiver1, setReceiver1] = useState(product.receiver1);
  const [percentr1, setPercentr1] = useState(product.percentr1);
  const [receiver2, setReceiver2] = useState(product.receiver2 || '');
  const [percentr2, setPercentr2] = useState(product.percentr2 || 0);
  const [useSecond, setUseSecond] = useState(!!product.receiver2);

  const totalPercent = percentr1 + (useSecond ? percentr2 : 0);
  const isValid = receiver1.trim() !== '' && totalPercent === 100;

  const handleSubmit = async () => {
    if (!isValid) return;
    const result = await updatePercentages(
      product.product, product.int_ref,
      receiver1, percentr1,
      useSecond ? receiver2 : '', useSecond ? percentr2 : 0
    );
    if (result.success) {
      toast({ title: 'Reparto actualizado', status: 'success', duration: 3000 });
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
          <HStack><Text>Cambiar Reparto</Text><Badge colorScheme="purple">{product.product}</Badge></HStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={loading} />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Receptor 1</FormLabel>
              <Input value={receiver1} onChange={(e) => setReceiver1(e.target.value)} placeholder="cuenta.wam" isDisabled={loading} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Porcentaje receptor 1</FormLabel>
              <NumberInput value={percentr1} onChange={(_, v) => setPercentr1(v || 0)} min={1} max={100} isDisabled={loading}>
                <NumberInputField />
                <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
              </NumberInput>
            </FormControl>

            <Divider />

            <Checkbox isChecked={useSecond} onChange={(e) => { setUseSecond(e.target.checked); if (!e.target.checked) setPercentr2(0); }} isDisabled={loading}>
              Usar segundo receptor
            </Checkbox>

            {useSecond && (
              <>
                <FormControl isRequired>
                  <FormLabel>Receptor 2</FormLabel>
                  <Input value={receiver2} onChange={(e) => setReceiver2(e.target.value)} placeholder="cuenta.wam" isDisabled={loading} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Porcentaje receptor 2</FormLabel>
                  <NumberInput value={percentr2} onChange={(_, v) => setPercentr2(v || 0)} min={0} max={99} isDisabled={loading}>
                    <NumberInputField />
                    <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </>
            )}

            {totalPercent !== 100 && (
              <Alert status="warning" rounded="md" fontSize="sm">
                <AlertIcon />
                <Text>Los porcentajes deben sumar 100% (actual: {totalPercent}%)</Text>
              </Alert>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose} isDisabled={loading}>Cancelar</Button>
            <Button colorScheme="purple" onClick={handleSubmit} isLoading={loading} isDisabled={!isValid}>
              Actualizar Reparto
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdatePercModal;
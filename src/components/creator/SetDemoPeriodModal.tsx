// src/components/creator/SetDemoPeriodModal.tsx
import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, FormHelperText, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  useToast, HStack, Text, Badge, VStack, Select,
} from '@chakra-ui/react';
import { DemoProduct } from '../../hooks/useDemoProducts';
import { useDemoActions } from '../../hooks/useDemoActions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: DemoProduct;
  onSuccess: () => void;
}

const PERIOD_OPTIONS = [
  { label: '1 hora', value: 3600 },
  { label: '6 horas', value: 21600 },
  { label: '12 horas', value: 43200 },
  { label: '1 día', value: 86400 },
  { label: '3 días', value: 259200 },
  { label: '7 días', value: 604800 },
  { label: '14 días', value: 1209600 },
  { label: '30 días', value: 2592000 },
  { label: 'Personalizado', value: -1 },
];

const formatPeriod = (seconds: number): string => {
  if (seconds < 60) return `${seconds} segundos`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutos`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} horas`;
  return `${(seconds / 86400).toFixed(1)} días`;
};

const SetDemoPeriodModal: React.FC<Props> = ({ isOpen, onClose, product, onSuccess }) => {
  const toast = useToast();
  const { setDemoPeriod, loading } = useDemoActions();

  const [periodOption, setPeriodOption] = useState<number>(product.period);
  const [customPeriod, setCustomPeriod] = useState<number>(product.period);

  const effectivePeriod = periodOption === -1 ? customPeriod : periodOption;

  const handleSubmit = async () => {
    if (effectivePeriod <= 0) return;
    const result = await setDemoPeriod(product.product, product.int_ref, effectivePeriod);
    if (result.success) {
      toast({ title: 'Período actualizado', status: 'success', duration: 3000 });
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
          <HStack><Text>Cambiar Período Demo</Text><Badge colorScheme="cyan">{product.product}</Badge></HStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={loading} />
        <ModalBody>
          <VStack spacing={4}>
            <Text fontSize="sm" color="gray.500">Período actual: <strong>{formatPeriod(product.period)}</strong></Text>
            <FormControl isRequired>
              <FormLabel>Nuevo período</FormLabel>
              <Select value={periodOption} onChange={(e) => setPeriodOption(Number(e.target.value))} isDisabled={loading}>
                {PERIOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </FormControl>
            {periodOption === -1 && (
              <FormControl isRequired>
                <FormLabel>Período personalizado (segundos)</FormLabel>
                <NumberInput value={customPeriod} onChange={(_, v) => setCustomPeriod(v || 60)} min={60} step={60} isDisabled={loading}>
                  <NumberInputField />
                  <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                </NumberInput>
                <FormHelperText>Equivale a: {formatPeriod(customPeriod)}</FormHelperText>
              </FormControl>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose} isDisabled={loading}>Cancelar</Button>
            <Button colorScheme="cyan" onClick={handleSubmit} isLoading={loading} isDisabled={effectivePeriod <= 0}>
              Actualizar Período
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SetDemoPeriodModal;
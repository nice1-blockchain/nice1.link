// src/components/creator/DemoModal.tsx
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
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Box,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
  Progress,
  Icon,
  Select,
} from '@chakra-ui/react';
import { CheckCircleIcon, RepeatIcon } from '@chakra-ui/icons';
import { GroupedAsset } from '../../hooks/useStock';
import { useDemo, DemoFlowParams } from '../../hooks/useDemo';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: GroupedAsset;
  onSuccess: () => void;
}

// Opciones predefinidas de período
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

/**
 * Formatea segundos en texto legible
 */
const formatPeriodDisplay = (seconds: number): string => {
  if (seconds < 60) return `${seconds} segundos`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutos`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} horas`;
  return `${(seconds / 86400).toFixed(1)} días`;
};

const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSuccess,
}) => {
  const toast = useToast();
  const { executeDemoFlow, restockDemoProduct, loading, error, currentStep, clearError, resetStep } = useDemo();

  // Formulario
  const [product, setProduct] = useState(asset.name);
  const [stockToSend, setStockToSend] = useState<number>(1);

  // Campos específicos de demo
  const [periodOption, setPeriodOption] = useState<number>(86400); // 1 día por defecto
  const [customPeriod, setCustomPeriod] = useState<number>(86400);

  // Estado post-demo
  const [completedIntRef, setCompletedIntRef] = useState<number | null>(null);

  // IDs disponibles (excluye el de referencia = ID más bajo)
  const sortedIds = useMemo(
    () => [...asset.ids].sort((a, b) => a - b),
    [asset.ids]
  );
  const referenceId = sortedIds[0];
  const availableIds = sortedIds.slice(1);
  const maxStock = availableIds.length;

  const idsToSend = useMemo(
    () => availableIds.slice(0, stockToSend),
    [availableIds, stockToSend]
  );

  const effectivePeriod = periodOption === -1 ? customPeriod : periodOption;

  const canSubmit =
    product.trim() !== '' &&
    stockToSend > 0 &&
    stockToSend <= maxStock &&
    effectivePeriod > 0;

  const getStepProgress = (): number => {
    switch (currentStep) {
      case 'setproduct': return 25;
      case 'transfer': return 75;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const getStepLabel = (): string => {
    switch (currentStep) {
      case 'setproduct': return 'Paso 1/2: Registrando producto demo...';
      case 'transfer': return 'Paso 2/2: Transfiriendo NFTs al contrato...';
      case 'completed': return '¡Completado!';
      default: return '';
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    clearError();

    const params: DemoFlowParams = {
      product: product.trim(),
      period: effectivePeriod,
      referenceNftId: referenceId,
      assetIdsToSend: idsToSend,
    };

    const result = await executeDemoFlow(params);

    if (result.success) {
      setCompletedIntRef(result.int_ref || null);
      toast({
        title: 'Demo configurado correctamente',
        description: `Producto "${product}" registrado con ${idsToSend.length} NFT(s) de stock.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onSuccess();
    } else {
      toast({
        title: 'Error en demo',
        description: result.error,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    if (!loading) {
      clearError();
      resetStep();
      setCompletedIntRef(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" closeOnOverlayClick={!loading}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Text>Configurar Demo</Text>
            <Badge colorScheme="cyan">Demo</Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={loading} />

        <ModalBody>
          {/* ÉXITO */}
          {currentStep === 'completed' && (
            <VStack spacing={4} py={6}>
              <Icon as={CheckCircleIcon} w={12} h={12} color="green.500" />
              <Text fontWeight="bold" fontSize="lg" color="green.500">
                ¡Demo configurado!
              </Text>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Producto: {product}
                <br />
                int_ref: {completedIntRef}
                <br />
                Stock enviado: {idsToSend.length} NFT(s)
                <br />
                Período: {formatPeriodDisplay(effectivePeriod)}
              </Text>
            </VStack>
          )}

          {/* FORMULARIO */}
          {currentStep !== 'completed' && !loading && (
            <VStack spacing={4} align="stretch">
              {/* Info del asset */}
              <HStack spacing={3}>
                {asset.image && (
                  <Image
                    src={asset.image.startsWith('Qm') ? `https://ipfs.io/ipfs/${asset.image}` : asset.image}
                    alt={asset.name}
                    boxSize="60px"
                    objectFit="cover"
                    rounded="md"
                  />
                )}
                <Box>
                  <Text fontWeight="bold">{asset.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {asset.ids.length} copia(s) · ID ref: {referenceId}
                  </Text>
                </Box>
              </HStack>

              <Alert status="info" rounded="md" fontSize="sm">
                <AlertIcon />
                <AlertDescription>
                  El demo requiere 2 firmas: 1) registrar producto y 2) transferir NFTs al contrato.
                  El ID más bajo ({referenceId}) se usa como referencia.
                </AlertDescription>
              </Alert>

              <Divider />

              <FormControl isRequired>
                <FormLabel>Nombre del producto</FormLabel>
                <Input
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="Nombre del producto"
                  isDisabled={loading}
                />
              </FormControl>

              <Divider />

              {/* PERÍODO DE DEMO */}
              <FormControl isRequired>
                <FormLabel>Período de demo</FormLabel>
                <Select
                  value={periodOption}
                  onChange={(e) => setPeriodOption(Number(e.target.value))}
                  isDisabled={loading}
                >
                  {PERIOD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {periodOption === -1 && (
                <FormControl isRequired>
                  <FormLabel>Período personalizado (segundos)</FormLabel>
                  <NumberInput
                    value={customPeriod}
                    onChange={(_, val) => setCustomPeriod(val || 60)}
                    min={60}
                    step={60}
                    isDisabled={loading}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText>
                    Equivale a: {formatPeriodDisplay(customPeriod)}
                  </FormHelperText>
                </FormControl>
              )}

              <Divider />

              <FormControl isRequired>
                <FormLabel>Stock inicial a enviar</FormLabel>
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
                  Disponibles: {maxStock} · IDs a enviar: {idsToSend.slice(0, 5).join(', ')}
                  {idsToSend.length > 5 && ` ... (+${idsToSend.length - 5} más)`}
                </FormHelperText>
              </FormControl>
            </VStack>
          )}

          {/* PROGRESO */}
          {loading && (
            <VStack spacing={4} py={6}>
              <Progress
                value={getStepProgress()}
                size="sm"
                colorScheme="cyan"
                width="100%"
                rounded="md"
                hasStripe
                isAnimated
              />
              <Text fontWeight="bold" color="cyan.500">
                {getStepLabel()}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Por favor, firma la transacción en tu wallet...
              </Text>
            </VStack>
          )}

          {/* ERROR */}
          {error && !loading && (
            <Alert status="error" rounded="md" mt={4}>
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </ModalBody>

        <ModalFooter>
          {currentStep === 'completed' ? (
            <Button onClick={handleClose}>Cerrar</Button>
          ) : (
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleClose} isDisabled={loading}>
                Cancelar
              </Button>
              <Button
                colorScheme="cyan"
                onClick={handleSubmit}
                isDisabled={!canSubmit || loading}
                isLoading={loading}
                leftIcon={<RepeatIcon />}
              >
                Configurar Demo
              </Button>
            </HStack>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DemoModal;
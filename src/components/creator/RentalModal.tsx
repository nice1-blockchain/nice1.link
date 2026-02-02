// src/components/creator/RentalModal.tsx
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
  Checkbox,
  Icon,
  Select,
} from '@chakra-ui/react';
import { CheckCircleIcon, RepeatIcon } from '@chakra-ui/icons';
import { GroupedAsset } from '../../hooks/useStock';
import { useRental, RentalFlowParams } from '../../hooks/useRental';

interface RentalModalProps {
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

const RentalModal: React.FC<RentalModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSuccess,
}) => {
  const toast = useToast();
  const { executeRentalFlow, restockRentalProduct, loading, error, currentStep, clearError, resetStep } = useRental();

  // Formulario
  const [product, setProduct] = useState(asset.name);
  const [price, setPrice] = useState<number>(1);
  const [receiver1, setReceiver1] = useState('');
  const [percentr1, setPercentr1] = useState<number>(100);
  const [receiver2, setReceiver2] = useState('');
  const [percentr2, setPercentr2] = useState<number>(0);
  const [useSecondReceiver, setUseSecondReceiver] = useState(false);
  const [stockToSend, setStockToSend] = useState<number>(1);
  
  // Campos específicos de alquiler
  const [periodOption, setPeriodOption] = useState<number>(86400); // 1 día por defecto
  const [customPeriod, setCustomPeriod] = useState<number>(86400);
  const [redelegate, setRedelegate] = useState<boolean>(false);

  // Estado post-alquiler
  const [rentalCompleted, setRentalCompleted] = useState(false);
  const [savedIntRef, setSavedIntRef] = useState<string | null>(null);
  const [restockMode, setRestockMode] = useState(false);
  const [restockAmount, setRestockAmount] = useState<number>(1);
  const [restockLoading, setRestockLoading] = useState(false);

  // IDs disponibles
  const sortedIds = useMemo(() => [...asset.ids].sort((a, b) => a - b), [asset.ids]);
  const referenceNftId = sortedIds[0];
  const availableIds = sortedIds.slice(1);
  const maxStock = availableIds.length;

  const idsToSend = useMemo(() => {
    return availableIds.slice(0, stockToSend);
  }, [availableIds, stockToSend]);

  const remainingIdsAfterRental = useMemo(() => {
    if (!rentalCompleted) return availableIds;
    return availableIds.slice(stockToSend);
  }, [availableIds, stockToSend, rentalCompleted]);

  const maxRestock = remainingIdsAfterRental.length;

  const idsToRestock = useMemo(() => {
    return remainingIdsAfterRental.slice(0, restockAmount);
  }, [remainingIdsAfterRental, restockAmount]);

  // Período efectivo
  const effectivePeriod = periodOption === -1 ? customPeriod : periodOption;

  const getStepProgress = (): number => {
    switch (currentStep) {
      case 'idle': return 0;
      case 'setproduct': return 50;
      case 'transfer': return 90;
      case 'completed': return 100;
      case 'error': return 0;
      default: return 0;
    }
  };

  const getStepLabel = (): string => {
    switch (currentStep) {
      case 'setproduct': return 'Paso 1/2: Registrando producto...';
      case 'transfer': return 'Paso 2/2: Enviando stock inicial...';
      case 'completed': return '¡Completado!';
      default: return '';
    }
  };

  const getImageUrl = (img: string): string => {
    if (!img) return '/placeholder-image.png';
    if (img.startsWith('ipfs://')) {
      const cid = img.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${cid}`;
    }
    return img;
  };

  const formatPeriodDisplay = (seconds: number): string => {
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} horas`;
    return `${Math.floor(seconds / 86400)} días`;
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!product.trim()) {
      toast({ title: 'El nombre del producto es requerido', status: 'warning', duration: 3000 });
      return;
    }
    if (price <= 0) {
      toast({ title: 'El precio debe ser mayor a 0', status: 'warning', duration: 3000 });
      return;
    }
    if (!receiver1.trim()) {
      toast({ title: 'El receptor 1 es requerido', status: 'warning', duration: 3000 });
      return;
    }
    if (percentr1 < 1 || percentr1 > 100) {
      toast({ title: 'El porcentaje 1 debe estar entre 1 y 100', status: 'warning', duration: 3000 });
      return;
    }
    if (useSecondReceiver && receiver2.trim() && (percentr1 + percentr2 > 100)) {
      toast({ title: 'La suma de porcentajes no puede superar 100', status: 'warning', duration: 3000 });
      return;
    }
    if (stockToSend < 1) {
      toast({ title: 'Debes enviar al menos 1 unidad de stock', status: 'warning', duration: 3000 });
      return;
    }
    if (effectivePeriod < 60) {
      toast({ title: 'El período debe ser al menos 60 segundos', status: 'warning', duration: 3000 });
      return;
    }

    const params: RentalFlowParams = {
      product: product.trim(),
      price,
      receiver1: receiver1.trim(),
      percentr1,
      receiver2: useSecondReceiver ? receiver2.trim() : '',
      percentr2: useSecondReceiver ? percentr2 : 0,
      period: effectivePeriod,
      redelegate,
      referenceNftId,
      assetIdsToSend: idsToSend,
    };

    const result = await executeRentalFlow(params);

    if (result.success) {
      setSavedIntRef(result.int_ref ? String(result.int_ref) : null);
      setRentalCompleted(true);

      toast({
        title: '¡Producto en alquiler!',
        description: `"${product}" está ahora disponible para alquilar.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: `Error en ${result.step || 'alquiler'}`,
        description: result.error || 'Error desconocido',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
  };

  const handleRestock = async () => {
    if (!savedIntRef) {
      toast({ title: 'No se encontró referencia del producto', status: 'error', duration: 3000 });
      return;
    }
    if (restockAmount < 1 || idsToRestock.length === 0) {
      toast({ title: 'Selecciona al menos 1 unidad', status: 'warning', duration: 3000 });
      return;
    }

    setRestockLoading(true);
    const result = await restockRentalProduct(idsToRestock, Number(savedIntRef));
    setRestockLoading(false);

    if (result.success) {
      toast({
        title: 'Stock repuesto',
        description: `Se han enviado ${restockAmount} unidad(es) adicionales.`,
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
    if (!loading && !restockLoading) {
      clearError();
      resetStep();
      setRentalCompleted(false);
      setSavedIntRef(null);
      setRestockMode(false);
      setRestockAmount(1);
      onClose();
    }
  };

  const handleFinish = () => {
    resetStep();
    setRentalCompleted(false);
    setSavedIntRef(null);
    setRestockMode(false);
    onSuccess();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" closeOnOverlayClick={!loading && !restockLoading}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {rentalCompleted
            ? (restockMode ? 'Reponer Stock' : '¡Alquiler Exitoso!')
            : 'Poner en Alquiler'}
        </ModalHeader>
        {!loading && !restockLoading && <ModalCloseButton />}

        <ModalBody>
          {/* PANTALLA DE ÉXITO */}
          {rentalCompleted && !restockMode && (
            <VStack spacing={6} align="stretch" py={4}>
              <VStack spacing={3}>
                <Icon as={CheckCircleIcon} boxSize={16} color="green.500" />
                <Text fontSize="xl" fontWeight="bold" color="green.500">
                  ¡Producto registrado para alquiler!
                </Text>
                <Text color="gray.500" textAlign="center">
                  "{product}" está disponible para alquilar por {formatPeriodDisplay(effectivePeriod)}.
                </Text>
              </VStack>

              <Divider />

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
                  <Text fontWeight="bold">{product}</Text>
                  <Text fontSize="sm" color="gray.500">Precio: {price.toFixed(4)} NICEOFI</Text>
                  <Text fontSize="sm" color="gray.500">Período: {formatPeriodDisplay(effectivePeriod)}</Text>
                  <Text fontSize="xs" color="gray.400">int_ref: {savedIntRef}</Text>
                </VStack>
              </HStack>

              {maxRestock > 0 ? (
                <Alert status="info" rounded="md">
                  <AlertIcon />
                  <Box flex="1">
                    <Text fontWeight="bold">¿Quieres enviar más stock?</Text>
                    <Text fontSize="sm">
                      Tienes {maxRestock} unidad(es) disponibles en tu wallet.
                    </Text>
                  </Box>
                </Alert>
              ) : (
                <Alert status="success" rounded="md">
                  <AlertIcon />
                  <Text>Todo el stock ha sido enviado al contrato de alquiler.</Text>
                </Alert>
              )}
            </VStack>
          )}

          {/* MODO REPOSICIÓN */}
          {rentalCompleted && restockMode && (
            <VStack spacing={4} align="stretch">
              <Alert status="info" rounded="md">
                <AlertIcon />
                <Text>
                  Stock disponible: <strong>{maxRestock}</strong> unidad(es)
                </Text>
              </Alert>

              <FormControl>
                <FormLabel>Cantidad a reponer</FormLabel>
                <NumberInput
                  value={restockAmount}
                  onChange={(_, val) => setRestockAmount(val || 1)}
                  min={1}
                  max={maxRestock}
                  isDisabled={restockLoading}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  IDs a enviar: {idsToRestock.slice(0, 5).join(', ')}
                  {idsToRestock.length > 5 && ` ... (+${idsToRestock.length - 5} más)`}
                </FormHelperText>
              </FormControl>
            </VStack>
          )}

          {/* FORMULARIO INICIAL */}
          {!rentalCompleted && !loading && (
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} p={3} bg="gray.50" rounded="md" _dark={{ bg: 'gray.700' }}>
                <Image
                  src={getImageUrl(asset.image)}
                  alt={asset.name}
                  boxSize="80px"
                  objectFit="cover"
                  rounded="md"
                  fallbackSrc="https://via.placeholder.com/80"
                />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">{asset.name}</Text>
                  <Badge colorScheme="blue">{asset.category}</Badge>
                  <Text fontSize="xs" color="gray.500">
                    NFT Referencia: #{referenceNftId}
                  </Text>
                </VStack>
              </HStack>

              <Alert status="info" rounded="md">
                <AlertIcon />
                <Text fontSize="sm">
                  Tienes <strong>{maxStock}</strong> unidad(es) disponibles para alquiler.
                </Text>
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

              <FormControl isRequired>
                <FormLabel>Precio (NICEOFI)</FormLabel>
                <NumberInput
                  value={price}
                  onChange={(_, val) => setPrice(val || 0)}
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
                <FormHelperText>Se formateará como: {price.toFixed(4)} NICEOFI</FormHelperText>
              </FormControl>

              <Divider />

              {/* PERÍODO DE ALQUILER */}
              <FormControl isRequired>
                <FormLabel>Período de alquiler</FormLabel>
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

              <Checkbox
                isChecked={redelegate}
                onChange={(e) => setRedelegate(e.target.checked)}
                isDisabled={loading}
              >
                Permitir redelegar (redelegate)
              </Checkbox>

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
              </FormControl>

              <Checkbox
                isChecked={useSecondReceiver}
                onChange={(e) => setUseSecondReceiver(e.target.checked)}
                isDisabled={loading}
              >
                Añadir segundo receptor
              </Checkbox>

              {useSecondReceiver && (
                <>
                  <FormControl>
                    <FormLabel>Receptor 2 (cuenta WAX)</FormLabel>
                    <Input
                      value={receiver2}
                      onChange={(e) => setReceiver2(e.target.value)}
                      placeholder="cuenta.wam (opcional)"
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
                      Total: {percentr1 + percentr2}% (debe ser ≤ 100%)
                    </FormHelperText>
                  </FormControl>
                </>
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
                  IDs a enviar: {idsToSend.slice(0, 5).join(', ')}
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
                colorScheme="teal"
                width="100%"
                rounded="md"
                hasStripe
                isAnimated
              />
              <Text fontWeight="bold" color="teal.500">
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
          {/* Botones según estado */}
          {rentalCompleted && !restockMode && (
            <HStack spacing={3}>
              {maxRestock > 0 && (
                <Button
                  leftIcon={<RepeatIcon />}
                  colorScheme="teal"
                  variant="outline"
                  onClick={() => setRestockMode(true)}
                >
                  Reponer Stock
                </Button>
              )}
              <Button colorScheme="green" onClick={handleFinish}>
                Finalizar
              </Button>
            </HStack>
          )}

          {rentalCompleted && restockMode && (
            <HStack spacing={3}>
              <Button variant="ghost" onClick={() => setRestockMode(false)} isDisabled={restockLoading}>
                Volver
              </Button>
              <Button
                colorScheme="teal"
                onClick={handleRestock}
                isLoading={restockLoading}
                loadingText="Enviando..."
                isDisabled={idsToRestock.length === 0}
              >
                Enviar {restockAmount} unidad(es)
              </Button>
            </HStack>
          )}

          {!rentalCompleted && (
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleClose} isDisabled={loading}>
                Cancelar
              </Button>
              <Button
                colorScheme="purple"
                onClick={handleSubmit}
                isLoading={loading}
                loadingText="Procesando..."
                isDisabled={maxStock === 0}
              >
                Poner en Alquiler
              </Button>
            </HStack>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RentalModal;
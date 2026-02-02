// src/components/creator/SaleModal.tsx
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
} from '@chakra-ui/react';
import { CheckCircleIcon, RepeatIcon } from '@chakra-ui/icons';
import { GroupedAsset } from '../../hooks/useStock';
import { useSale, SaleFlowParams } from '../../hooks/useSale';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: GroupedAsset;
  onSuccess: () => void;
}

const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSuccess,
}) => {
  const toast = useToast();
  const { executeSaleFlow, restockProduct, loading, error, currentStep, clearError, resetStep } = useSale();

  // Formulario de venta
  const [product, setProduct] = useState(asset.name);
  const [price, setPrice] = useState<number>(1);
  const [receiver1, setReceiver1] = useState('');
  const [percentr1, setPercentr1] = useState<number>(100);
  const [receiver2, setReceiver2] = useState('');
  const [percentr2, setPercentr2] = useState<number>(0);
  const [useSecondReceiver, setUseSecondReceiver] = useState(false);
  const [stockToSend, setStockToSend] = useState<number>(1);

  // Estado post-venta para reposición
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [savedIntRef, setSavedIntRef] = useState<string | null>(null);
  const [restockMode, setRestockMode] = useState(false);
  const [restockAmount, setRestockAmount] = useState<number>(1);
  const [restockLoading, setRestockLoading] = useState(false);

  // IDs disponibles (excluyendo el ID más bajo que es la referencia)
  const sortedIds = useMemo(() => [...asset.ids].sort((a, b) => a - b), [asset.ids]);
  const referenceNftId = sortedIds[0]; // ID más bajo = referencia
  const availableIds = sortedIds.slice(1); // IDs disponibles para venta
  const maxStock = availableIds.length;

  // IDs que se enviarán como stock inicial
  const idsToSend = useMemo(() => {
    return availableIds.slice(0, stockToSend);
  }, [availableIds, stockToSend]);

  // IDs disponibles para reposición (después de venta completada)
  const remainingIdsAfterSale = useMemo(() => {
    if (!saleCompleted) return availableIds;
    return availableIds.slice(stockToSend); // Los que quedan después del envío inicial
  }, [availableIds, stockToSend, saleCompleted]);

  const maxRestock = remainingIdsAfterSale.length;

  // IDs que se enviarán en reposición
  const idsToRestock = useMemo(() => {
    return remainingIdsAfterSale.slice(0, restockAmount);
  }, [remainingIdsAfterSale, restockAmount]);

  // Progreso del flujo (2 pasos)
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

    const params: SaleFlowParams = {
      product: product.trim(),
      price,
      receiver1: receiver1.trim(),
      percentr1,
      receiver2: useSecondReceiver ? receiver2.trim() : '',
      percentr2: useSecondReceiver ? percentr2 : 0,
      referenceNftId,
      assetIdsToSend: idsToSend,
    };

    const result = await executeSaleFlow(params);

    if (result.success) {
      // Guardar int_ref para posibles reposiciones
      setSavedIntRef(result.int_ref ? String(result.int_ref) : null);
      setSaleCompleted(true);
      
      toast({
        title: '¡Producto en venta!',
        description: `"${product}" está ahora en venta con ${stockToSend} unidad(es) de stock.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: `Error en ${result.step || 'venta'}`,
        description: result.error || 'Error desconocido',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
  };

  // Handler para reponer stock
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
    const result = await restockProduct(idsToRestock, Number(savedIntRef));
    setRestockLoading(false);

    if (result.success) {
      toast({
        title: 'Stock repuesto',
        description: `Se han enviado ${restockAmount} unidad(es) adicionales.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // Actualizar estado para reflejar los NFTs enviados
      onSuccess(); // Cerrar y recargar
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
      // Resetear estados de reposición
      setSaleCompleted(false);
      setSavedIntRef(null);
      setRestockMode(false);
      setRestockAmount(1);
      onClose();
    }
  };

  // Cerrar y finalizar (después de venta exitosa)
  const handleFinish = () => {
    resetStep();
    setSaleCompleted(false);
    setSavedIntRef(null);
    setRestockMode(false);
    onSuccess();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" closeOnOverlayClick={!loading && !restockLoading}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {saleCompleted 
            ? (restockMode ? 'Reponer Stock' : '¡Venta Exitosa!') 
            : 'Poner en Venta'}
        </ModalHeader>
        {!loading && !restockLoading && <ModalCloseButton />}

        <ModalBody>
          {/* PANTALLA DE ÉXITO CON OPCIÓN DE REPOSICIÓN */}
          {saleCompleted && !restockMode && (
            <VStack spacing={6} align="stretch" py={4}>
              <VStack spacing={3}>
                <Icon as={CheckCircleIcon} boxSize={16} color="green.500" />
                <Text fontSize="xl" fontWeight="bold" color="green.500">
                  ¡Producto registrado correctamente!
                </Text>
                <Text color="gray.500" textAlign="center">
                  "{product}" está ahora en venta con {stockToSend} unidad(es) de stock inicial.
                </Text>
              </VStack>

              <Divider />

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
                  <Text fontWeight="bold">{product}</Text>
                  <Text fontSize="sm" color="gray.500">Precio: {price.toFixed(4)} NICEOFI</Text>
                  <Text fontSize="xs" color="gray.400">int_ref: {savedIntRef}</Text>
                </VStack>
              </HStack>

              {/* Opción de reponer más stock */}
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
                <Alert status="warning" rounded="md">
                  <AlertIcon />
                  <Text>No tienes más unidades disponibles para enviar.</Text>
                </Alert>
              )}
            </VStack>
          )}

          {/* FORMULARIO DE REPOSICIÓN */}
          {saleCompleted && restockMode && (
            <VStack spacing={4} align="stretch">
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
                  <Badge colorScheme="green">On Sale</Badge>
                  <Text fontSize="xs" color="gray.400">int_ref: {savedIntRef}</Text>
                </VStack>
              </HStack>

              <FormControl isRequired>
                <FormLabel>Cantidad a enviar</FormLabel>
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
                  Disponibles: {maxRestock} | IDs a enviar: {idsToRestock.join(', ')}
                </FormHelperText>
              </FormControl>
            </VStack>
          )}

          {/* FORMULARIO DE VENTA INICIAL */}
          {!saleCompleted && (
            <VStack spacing={4} align="stretch">
              {/* Info del asset */}
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
                  <Text fontWeight="bold">{asset.name}</Text>
                  <Badge colorScheme="purple">{asset.category}</Badge>
                  <Text fontSize="sm" color="gray.500">
                    {asset.copyCount} copias totales
                  </Text>
                  <Text fontSize="xs" color="teal.500">
                    NFT Referencia: #{referenceNftId}
                  </Text>
                </VStack>
              </HStack>

              <Alert status="info" rounded="md" fontSize="sm">
                <AlertIcon />
                <Text>
                  El NFT #{referenceNftId} (ID más bajo) se usará como referencia y NO se venderá.
                  Tienes <strong>{maxStock}</strong> unidad(es) disponibles para venta.
                </Text>
              </Alert>

              <Divider />

              {/* Formulario */}
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

              <Checkbox
                isChecked={useSecondReceiver}
                onChange={(e) => {
                  setUseSecondReceiver(e.target.checked);
                  if (!e.target.checked) {
                    setReceiver2('');
                    setPercentr2(0);
                  }
                }}
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
                  Máximo disponible: {maxStock} | IDs a enviar: {idsToSend.join(', ')}
                </FormHelperText>
              </FormControl>

              {/* Progreso */}
              {loading && (
                <Box>
                  <Text fontSize="sm" mb={2} color="teal.500">
                    {getStepLabel()}
                  </Text>
                  <Progress
                    value={getStepProgress()}
                    size="sm"
                    colorScheme="teal"
                    hasStripe
                    isAnimated
                  />
                </Box>
              )}

              {error && (
                <Alert status="error" rounded="md">
                  <AlertIcon />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          {/* Botones para pantalla de éxito */}
          {saleCompleted && !restockMode && (
            <>
              {maxRestock > 0 && (
                <Button
                  colorScheme="teal"
                  leftIcon={<RepeatIcon />}
                  mr={3}
                  onClick={() => setRestockMode(true)}
                >
                  Reponer/Mandar Stock
                </Button>
              )}
              <Button variant="outline" onClick={handleFinish}>
                Finalizar
              </Button>
            </>
          )}

          {/* Botones para formulario de reposición */}
          {saleCompleted && restockMode && (
            <>
              <Button
                colorScheme="teal"
                mr={3}
                onClick={handleRestock}
                isLoading={restockLoading}
                loadingText="Enviando..."
                isDisabled={maxRestock === 0}
              >
                Enviar Stock ({restockAmount})
              </Button>
              <Button variant="ghost" onClick={() => setRestockMode(false)} isDisabled={restockLoading}>
                Volver
              </Button>
            </>
          )}

          {/* Botones para formulario de venta inicial */}
          {!saleCompleted && (
            <>
              <Button
                colorScheme="teal"
                mr={3}
                onClick={handleSubmit}
                isLoading={loading}
                loadingText={getStepLabel()}
                isDisabled={maxStock === 0}
              >
                Poner en Venta
              </Button>
              <Button variant="ghost" onClick={handleClose} isDisabled={loading}>
                Cancelar
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SaleModal;
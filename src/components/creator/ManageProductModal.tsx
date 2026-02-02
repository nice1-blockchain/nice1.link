// src/components/creator/ManageProductModal.tsx
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
  Checkbox,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { RepeatIcon, LockIcon, UnlockIcon, EditIcon } from '@chakra-ui/icons';
import { GroupedAsset } from '../../hooks/useStock';
import { useSale } from '../../hooks/useSale';
import { SaleProduct } from '../../hooks/useSalesProducts';

interface ManageProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: GroupedAsset;
  saleProduct: SaleProduct;
  onSuccess: () => void;
}

const ManageProductModal: React.FC<ManageProductModalProps> = ({
  isOpen,
  onClose,
  asset,
  saleProduct,
  onSuccess,
}) => {
  const toast = useToast();
  const {
    restockProduct,
    toggleProduct,
    updatePrice,
    updatePercentages,
    loading,
    error,
    clearError,
  } = useSale();

  // Tab activa
  const [tabIndex, setTabIndex] = useState(0);

  // Estado para Reponer Stock
  const [restockAmount, setRestockAmount] = useState<number>(1);

  // Estado para Toggle (desactivar/activar)
  const [confirmToggle, setConfirmToggle] = useState(false);

  // Estado para Update Price
  const [newPrice, setNewPrice] = useState<number>(
    parseFloat(saleProduct.price.split(' ')[0]) || 1
  );

  // Estado para Update Percentages
  const [newReceiver1, setNewReceiver1] = useState(saleProduct.receiver1);
  const [newPercentr1, setNewPercentr1] = useState(saleProduct.percentr1);
  const [newReceiver2, setNewReceiver2] = useState(saleProduct.receiver2 || '');
  const [newPercentr2, setNewPercentr2] = useState(saleProduct.percentr2 || 0);

  // IDs disponibles (excluyendo el ID más bajo que es la referencia)
  const sortedIds = useMemo(() => [...asset.ids].sort((a, b) => a - b), [asset.ids]);
  const referenceNftId = sortedIds[0];
  const availableIds = sortedIds.slice(1);
  const maxRestock = availableIds.length;

  const idsToRestock = useMemo(() => {
    return availableIds.slice(0, restockAmount);
  }, [availableIds, restockAmount]);

  const getImageUrl = (img: string): string => {
    if (!img) return '/placeholder-image.png';
    if (img.startsWith('ipfs://')) {
      const cid = img.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${cid}`;
    }
    return img;
  };

  const isActive = saleProduct.active !== false; // Por defecto activo si no está definido

  // Handler: Reponer Stock
  const handleRestock = async () => {
    if (restockAmount < 1 || idsToRestock.length === 0) {
      toast({ title: 'Selecciona al menos 1 unidad', status: 'warning', duration: 3000 });
      return;
    }

    const result = await restockProduct(idsToRestock, saleProduct.int_ref);

    if (result.success) {
      toast({
        title: 'Stock repuesto',
        description: `Se han enviado ${restockAmount} unidad(es).`,
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

  // Handler: Toggle (Desactivar/Activar)
  const handleToggle = async () => {
    if (!confirmToggle) {
      toast({ title: 'Debes confirmar la acción', status: 'warning', duration: 3000 });
      return;
    }

    const result = await toggleProduct(saleProduct.product, saleProduct.int_ref.toString(), !isActive);

    if (result.success) {
      toast({
        title: isActive ? 'Producto desactivado' : 'Producto activado',
        description: `"${saleProduct.product}" ha sido ${isActive ? 'desactivado' : 'activado'}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setConfirmToggle(false);
      onSuccess();
    } else {
      toast({
        title: 'Error al cambiar estado',
        description: result.error || 'Error desconocido',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
  };

  // Handler: Update Price
  const handleUpdatePrice = async () => {
    if (newPrice <= 0) {
      toast({ title: 'El precio debe ser mayor a 0', status: 'warning', duration: 3000 });
      return;
    }

    const result = await updatePrice(saleProduct.product, saleProduct.int_ref.toString(), newPrice);

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

  // Handler: Update Percentages
  const handleUpdatePercentages = async () => {
    if (!newReceiver1.trim()) {
      toast({ title: 'Receptor 1 es requerido', status: 'warning', duration: 3000 });
      return;
    }
    if (newPercentr1 < 1 || newPercentr1 > 100) {
      toast({ title: 'Porcentaje 1 debe estar entre 1 y 100', status: 'warning', duration: 3000 });
      return;
    }
    if (newReceiver2 && (newPercentr1 + newPercentr2 > 100)) {
      toast({ title: 'La suma de porcentajes no puede superar 100', status: 'warning', duration: 3000 });
      return;
    }

    const result = await updatePercentages(
      saleProduct.product,
      saleProduct.int_ref.toString(),
      newReceiver1.trim(),
      newPercentr1,
      newReceiver2.trim(),
      newPercentr2
    );

    if (result.success) {
      toast({
        title: 'Porcentajes actualizados',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onSuccess();
    } else {
      toast({
        title: 'Error al actualizar porcentajes',
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
      setConfirmToggle(false);
      setTabIndex(0);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" closeOnOverlayClick={!loading}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Gestionar Producto en Venta</ModalHeader>
        {!loading && <ModalCloseButton />}

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Info del producto */}
            <HStack spacing={4} p={3} bg="gray.50" rounded="md" _dark={{ bg: 'gray.700' }}>
              <Image
                src={getImageUrl(asset.image)}
                alt={asset.name}
                boxSize="70px"
                objectFit="cover"
                rounded="md"
                fallbackSrc="https://via.placeholder.com/70"
              />
              <VStack align="start" spacing={1} flex={1}>
                <Text fontWeight="bold">{saleProduct.product}</Text>
                <HStack>
                  <Badge colorScheme={isActive ? 'green' : 'red'}>
                    {isActive ? 'Activo' : 'Desactivado'}
                  </Badge>
                  <Badge colorScheme="purple">{asset.category}</Badge>
                </HStack>
                <Text fontSize="sm" color="gray.500">
                  Precio: {saleProduct.price}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  int_ref: {saleProduct.int_ref}
                </Text>
              </VStack>
            </HStack>

            <Divider />

            {/* Tabs de acciones */}
            <Tabs index={tabIndex} onChange={setTabIndex} variant="enclosed" colorScheme="teal">
              <TabList>
                <Tab fontSize="sm">
                  <RepeatIcon mr={2} /> Reponer
                </Tab>
                <Tab fontSize="sm">
                  {isActive ? <LockIcon mr={2} /> : <UnlockIcon mr={2} />}
                  {isActive ? 'Desactivar' : 'Activar'}
                </Tab>
                <Tab fontSize="sm">
                  <EditIcon mr={2} /> Precio
                </Tab>
                <Tab fontSize="sm">
                  <EditIcon mr={2} /> Porcentajes
                </Tab>
              </TabList>

              <TabPanels>
                {/* TAB: Reponer Stock */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    {maxRestock === 0 ? (
                      <Alert status="warning" rounded="md">
                        <AlertIcon />
                        <Text>
                          No tienes unidades disponibles en tu wallet. Duplica más copias primero.
                        </Text>
                      </Alert>
                    ) : (
                      <>
                        <Alert status="info" rounded="md" fontSize="sm">
                          <AlertIcon />
                          <Text>
                            Tienes <strong>{maxRestock}</strong> unidad(es) disponibles.
                            NFT #{referenceNftId} es la referencia y no se puede enviar.
                          </Text>
                        </Alert>

                        <FormControl isRequired>
                          <FormLabel>Cantidad a enviar</FormLabel>
                          <NumberInput
                            value={restockAmount}
                            onChange={(_, val) => setRestockAmount(val || 1)}
                            min={1}
                            max={maxRestock}
                            isDisabled={loading}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                          <FormHelperText>
                            IDs a enviar: {idsToRestock.join(', ')}
                          </FormHelperText>
                        </FormControl>

                        <Button
                          colorScheme="teal"
                          leftIcon={<RepeatIcon />}
                          onClick={handleRestock}
                          isLoading={loading}
                          loadingText="Enviando..."
                          isDisabled={maxRestock === 0}
                        >
                          Enviar Stock ({restockAmount})
                        </Button>
                      </>
                    )}
                  </VStack>
                </TabPanel>

                {/* TAB: Toggle (Desactivar/Activar) */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Alert status={isActive ? 'warning' : 'info'} rounded="md">
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="bold">
                          {isActive ? '¿Desactivar venta?' : '¿Activar venta?'}
                        </Text>
                        <Text fontSize="sm">
                          {isActive
                            ? 'El producto dejará de estar disponible para compra.'
                            : 'El producto volverá a estar disponible para compra.'}
                        </Text>
                      </Box>
                    </Alert>

                    <Checkbox
                      isChecked={confirmToggle}
                      onChange={(e) => setConfirmToggle(e.target.checked)}
                      colorScheme={isActive ? 'red' : 'green'}
                      isDisabled={loading}
                    >
                      Confirmo que quiero {isActive ? 'desactivar' : 'activar'} este producto
                    </Checkbox>

                    <Button
                      colorScheme={isActive ? 'red' : 'green'}
                      leftIcon={isActive ? <LockIcon /> : <UnlockIcon />}
                      onClick={handleToggle}
                      isLoading={loading}
                      loadingText="Procesando..."
                      isDisabled={!confirmToggle}
                    >
                      {isActive ? 'Desactivar Venta' : 'Activar Venta'}
                    </Button>
                  </VStack>
                </TabPanel>

                {/* TAB: Update Price */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="sm" color="gray.500">
                      Precio actual: <strong>{saleProduct.price}</strong>
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

                    <Button
                      colorScheme="blue"
                      leftIcon={<EditIcon />}
                      onClick={handleUpdatePrice}
                      isLoading={loading}
                      loadingText="Actualizando..."
                    >
                      Actualizar Precio
                    </Button>
                  </VStack>
                </TabPanel>

                {/* TAB: Update Percentages */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="sm" color="gray.500">
                      Actual: {saleProduct.receiver1} ({saleProduct.percentr1}%)
                      {saleProduct.receiver2 && `, ${saleProduct.receiver2} (${saleProduct.percentr2}%)`}
                    </Text>

                    <FormControl isRequired>
                      <FormLabel>Receptor 1 (cuenta WAX)</FormLabel>
                      <Input
                        value={newReceiver1}
                        onChange={(e) => setNewReceiver1(e.target.value)}
                        placeholder="cuenta.wam"
                        isDisabled={loading}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Porcentaje receptor 1</FormLabel>
                      <NumberInput
                        value={newPercentr1}
                        onChange={(_, val) => setNewPercentr1(val || 0)}
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

                    <FormControl>
                      <FormLabel>Receptor 2 (opcional)</FormLabel>
                      <Input
                        value={newReceiver2}
                        onChange={(e) => setNewReceiver2(e.target.value)}
                        placeholder="cuenta.wam"
                        isDisabled={loading}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Porcentaje receptor 2</FormLabel>
                      <NumberInput
                        value={newPercentr2}
                        onChange={(_, val) => setNewPercentr2(val || 0)}
                        min={0}
                        max={100 - newPercentr1}
                        isDisabled={loading}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <Button
                      colorScheme="blue"
                      leftIcon={<EditIcon />}
                      onClick={handleUpdatePercentages}
                      isLoading={loading}
                      loadingText="Actualizando..."
                    >
                      Actualizar Porcentajes
                    </Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

            {error && (
              <Alert status="error" rounded="md">
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={handleClose} isDisabled={loading}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ManageProductModal;
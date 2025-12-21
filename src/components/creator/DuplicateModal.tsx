// src/components/creator/DuplicateModal.tsx
import React, { useState, useRef } from 'react';
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  FormHelperText,
  useToast,
  Box,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { GroupedAsset } from '../../hooks/useStock';
import { useDuplicate } from '../../hooks/useDuplicate';

interface DuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: GroupedAsset;
  onSuccess: () => void;
}

const DuplicateModal: React.FC<DuplicateModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSuccess,
}) => {
  const toast = useToast();
  const { duplicateAsset, loading, error, clearError } = useDuplicate();

  const [copies, setCopies] = useState<number>(1);

  // Estado y ref para el AlertDialog de confirmación
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Handler que abre el AlertDialog de confirmación
  const handleDuplicateClick = () => {
    onAlertOpen();
  };

  // Handler que ejecuta la duplicación después de confirmar
  const handleConfirmDuplicate = async () => {
    onAlertClose();

    const result = await duplicateAsset(asset, copies);

    if (result.success) {
      toast({
        title: '¡Assets duplicados exitosamente!',
        description: `Se han creado ${copies} copia${copies !== 1 ? 's' : ''} de "${asset.name}"`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setCopies(1);
      onSuccess();
    } else {
      toast({
        title: 'Error al duplicar',
        description: result.error || 'Ha ocurrido un error desconocido',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCopies(1);
      clearError?.();
      onClose();
    }
  };

  // Obtener imagen del asset
  const getImageUrl = () => {
    if (asset.mdata?.img) {
      const img = asset.mdata.img;
      if (img.startsWith('ipfs://')) {
        return `https://ipfs.io/ipfs/${img.replace('ipfs://', '')}`;
      }
      if (img.startsWith('Qm') || img.startsWith('bafy')) {
        return `https://ipfs.io/ipfs/${img}`;
      }
      return img;
    }
    return null;
  };

  const imageUrl = getImageUrl();

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Duplicar Asset</ModalHeader>
          <ModalCloseButton isDisabled={loading} />

          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Info del asset */}
              <Box p={4} bg="gray.50" rounded="md">
                <HStack spacing={4}>
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={asset.name}
                      boxSize="80px"
                      objectFit="cover"
                      rounded="md"
                      fallback={
                        <Box
                          boxSize="80px"
                          bg="gray.200"
                          rounded="md"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text fontSize="xs" color="gray.500">
                            Sin imagen
                          </Text>
                        </Box>
                      }
                    />
                  )}
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="bold" fontSize="lg">
                      {asset.name}
                    </Text>
                    <HStack>
                      <Badge colorScheme="purple">{asset.category}</Badge>
                      <Badge colorScheme="teal">
                        {asset.copyCount} {asset.copyCount === 1 ? 'copia' : 'copias'} existentes
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      Author: {asset.author}
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Divider />

              {/* Input de número de copias */}
              <FormControl>
                <FormLabel>¿Cuántas copias quieres crear?</FormLabel>
                <NumberInput
                  value={copies}
                  onChange={(_, valueAsNumber) => setCopies(valueAsNumber)}
                  min={1}
                  max={100}
                  clampValueOnBlur
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  Mínimo: 1 • Máximo: 100 copias por transacción
                </FormHelperText>
              </FormControl>

              {/* Información adicional */}
              <Alert status="info" rounded="md" fontSize="sm">
                <AlertIcon />
                <Box flex="1">
                  <AlertDescription>
                    Se crearán <strong>{copies}</strong> {copies === 1 ? 'copia' : 'copias'} idéntica
                    {copies !== 1 ? 's' : ''} con todos los datos del asset original.
                    {copies > 50 && (
                      <Text mt={2} color="orange.600">
                        ⚠️ Crear más de 50 copias puede tardar más tiempo.
                      </Text>
                    )}
                  </AlertDescription>
                </Box>
              </Alert>

              {/* Error persistente */}
              {error && (
                <Alert status="error" rounded="md">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">{error}</AlertDescription>
                </Alert>
              )}

              {/* Datos que se duplicarán */}
              <Box fontSize="xs" color="gray.500" p={3} bg="gray.50" rounded="md">
                <Text fontWeight="bold" mb={2}>
                  Datos a duplicar:
                </Text>
                <Text>
                  <strong>idata:</strong> {JSON.stringify(asset.idata)}
                </Text>
                <Text mt={1}>
                  <strong>mdata:</strong> {JSON.stringify(asset.mdata)}
                </Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="teal"
              mr={3}
              onClick={handleDuplicateClick}
              isLoading={loading}
              loadingText={`Creando ${copies} ${copies === 1 ? 'copia' : 'copias'}...`}
              isDisabled={copies < 1 || copies > 100}
            >
              Duplicar ({copies})
            </Button>
            <Button variant="ghost" onClick={handleClose} isDisabled={loading}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AlertDialog de confirmación */}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirmar duplicación
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack spacing={3} align="stretch">
                <Text>
                  Vas a consumir recursos de blockchain para crear{' '}
                  <strong>{copies}</strong> {copies === 1 ? 'copia' : 'copias'} de{' '}
                  <strong>"{asset.name}"</strong>.
                </Text>
                <Alert status="warning" rounded="md" fontSize="sm">
                  <AlertIcon />
                  <Text>¿Es esta la licencia final?</Text>
                </Alert>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Cancelar
              </Button>
              <Button colorScheme="teal" onClick={handleConfirmDuplicate} ml={3}>
                Aceptar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default DuplicateModal;
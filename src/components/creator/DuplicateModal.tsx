// src/components/creator/DuplicateModal.tsx
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

  const handleDuplicate = async () => {
    const result = await duplicateAsset(asset, copies);

    if (result.success) {
      toast({
        title: '¡Assets duplicados exitosamente!',
        description: `Se han creado ${copies} copia${copies !== 1 ? 's' : ''} de "${asset.name}"`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      onSuccess();
    } else {
      toast({
        title: 'Error al duplicar asset',
        description: result.error || 'Ocurrió un error desconocido',
        status: 'error',
        duration: 8000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const handleClose = () => {
    clearError();
    setCopies(1);
    onClose();
  };

  // Convertir IPFS a URL HTTP
  const getImageUrl = (img: string): string => {
    if (!img) return '/placeholder-image.png';
    
    if (img.startsWith('ipfs://')) {
      const cid = img.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${cid}`;
    }
    
    return img;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Duplicar Asset</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Preview del Asset */}
            <Box borderWidth="1px" rounded="md" p={4}>
              <HStack spacing={4}>
                <Image
                  src={getImageUrl(asset.image)}
                  alt={asset.name}
                  boxSize="100px"
                  objectFit="cover"
                  rounded="md"
                  fallbackSrc="https://via.placeholder.com/100?text=No+Image"
                />
                <VStack align="start" flex="1" spacing={1}>
                  <Text fontWeight="bold" fontSize="lg">
                    {asset.name}
                  </Text>
                  <HStack>
                    <Badge colorScheme="blue">{asset.category}</Badge>
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
            onClick={handleDuplicate}
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
  );
};

export default DuplicateModal;
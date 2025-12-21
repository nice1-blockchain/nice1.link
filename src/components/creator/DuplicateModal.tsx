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
        title: 'Assets successfully duplicated!',
        description: `They have been created ${copies} unit${copies !== 1 ? 's' : ''} of "${asset.name}"`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setCopies(1);
      onSuccess();
    } else {
      toast({
        title: 'Error duplicating asset',
        description: result.error || 'An unknown error occurred',
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
          <ModalHeader>Duplicate Asset</ModalHeader>
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
                        {asset.copyCount} {asset.copyCount === 1 ? 'unit' : 'units'} existentes
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
                <FormLabel>How many units do you want to create?</FormLabel>
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
                  Minimum: 1 • Maximum: 100 units per transaction
                </FormHelperText>
              </FormControl>

              {/* Información adicional */}
              <Alert status="info" rounded="md" fontSize="sm">
                <AlertIcon />
                <Box flex="1">
                  <AlertDescription>
                    They will be created <strong>{copies}</strong> {copies === 1 ? 'unit' : 'units'} identical
                    {copies !== 1 ? 's' : ''} with all the data of the original asset.
                    {copies > 50 && (
                      <Text mt={2} color="orange.600">
                        ⚠️ Creating more than 50 units may take longer.
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
                  Data to be duplicated:
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
              loadingText={`Creating ${copies} ${copies === 1 ? 'unit' : 'units'}...`}
              isDisabled={copies < 1 || copies > 100}
            >
              Duplicate ({copies})
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
              Confirm duplication
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack spacing={3} align="stretch">
                <Text>
                  You are about to consume blockchain resources to create{' '}
                  <strong>{copies}</strong> {copies === 1 ? 'unit' : 'units'} de{' '}
                  <strong>"{asset.name}"</strong>.
                </Text>
                <Alert status="warning" rounded="md" fontSize="sm">
                  <AlertIcon />
                  <Text>Is this the final license?</Text>
                </Alert>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Cancel
              </Button>
              <Button colorScheme="teal" onClick={handleConfirmDuplicate} ml={3}>
                Accept
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default DuplicateModal;
// src/components/creator/BurnModal.tsx
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
  Box,
  Badge,
  Image,
  Alert,
  AlertIcon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  RadioGroup,
  Radio,
  Stack,
} from '@chakra-ui/react';
import { GroupedAsset } from '../../contexts/StockContext';
import { useBurn } from '../../hooks/useBurn';

interface BurnModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: GroupedAsset;
  onSuccess: () => void;
}

const BurnModal: React.FC<BurnModalProps> = ({ isOpen, onClose, asset, onSuccess }) => {
  const [burnOption, setBurnOption] = useState<'all' | 'select'>('all');
  const [quantity, setQuantity] = useState(1);
  const { burnAsset, loading, error, clearError } = useBurn();
  const toast = useToast();

  // AlertDialog para confirmación
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const totalCopies = asset.ids.length;

  // IDs a quemar según la opción seleccionada
  const getIdsToBurn = (): number[] => {
    if (burnOption === 'all') {
      return asset.ids;
    }
    // Seleccionar los primeros N IDs
    return asset.ids.slice(0, quantity);
  };

  const handleBurnClick = () => {
    onAlertOpen();
  };

  const handleConfirmBurn = async () => {
    onAlertClose();

    const idsToBurn = getIdsToBurn();
    const result = await burnAsset(idsToBurn);

    if (result.success) {
      toast({
        title: '🔥 Assets burned',
        description: `They have been removed ${idsToBurn.length} units${idsToBurn.length !== 1 ? 'es' : ''} de "${asset.name}"`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      handleClose();
      onSuccess();
    } else {
      toast({
        title: 'Burning error',
        description: result.error || 'Unknown error',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    if (!loading) {
      setBurnOption('all');
      setQuantity(1);
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
  const burnCount = burnOption === 'all' ? totalCopies : quantity;

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="red.500">🔥 Burn Asset</ModalHeader>
          <ModalCloseButton isDisabled={loading} />

          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Info del asset */}
              <Box p={4} bg="gray.50" rounded="md" _dark={{ bg: 'gray.700' }}>
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
                      <Badge colorScheme="blue">
                        {totalCopies} {totalCopies === 1 ? 'copia' : 'copias'}
                      </Badge>
                    </HStack>
                  </VStack>
                </HStack>
              </Box>

              {/* Opciones de quemado */}
              <Box>
                <Text fontWeight="medium" mb={3}>
                  How many units do you want to burn?
                </Text>
                <RadioGroup value={burnOption} onChange={(val) => setBurnOption(val as 'all' | 'select')}>
                  <Stack spacing={3}>
                    <Radio value="all" colorScheme="red">
                      <HStack>
                        <Text>All units</Text>
                        <Badge colorScheme="red">{totalCopies}</Badge>
                      </HStack>
                    </Radio>
                    <Radio value="select" colorScheme="orange" isDisabled={totalCopies === 1}>
                      <Text>Select quantity</Text>
                    </Radio>
                  </Stack>
                </RadioGroup>

                {burnOption === 'select' && totalCopies > 1 && (
                  <Box mt={3} pl={6}>
                    <HStack>
                      <Text fontSize="sm">Cantidad:</Text>
                      <NumberInput
                        size="sm"
                        maxW={24}
                        min={1}
                        max={totalCopies}
                        value={quantity}
                        onChange={(_, val) => setQuantity(val || 1)}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Text fontSize="sm" color="gray.500">
                        de {totalCopies}
                      </Text>
                    </HStack>
                  </Box>
                )}
              </Box>

              {/* Alerta de advertencia */}
              <Alert status="error" rounded="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold" fontSize="sm">
                    Irreversible action!
                  </Text>
                  <Text fontSize="sm">
                    This action will permanently remove{' '}
                    <strong>{burnCount}</strong> {burnCount === 1 ? 'unit' : 'units'} from the blockchain.
                  </Text>
                </Box>
              </Alert>

              {error && (
                <Alert status="error" rounded="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={handleBurnClick}
              isLoading={loading}
              loadingText={`Quemando ${burnCount}...`}
            >
              🔥 Burn ({burnCount})
            </Button>
            <Button variant="ghost" onClick={handleClose} isDisabled={loading}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AlertDialog de confirmación final */}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="red.500">
              ⚠️ Confirm deletion
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack spacing={3} align="stretch">
                <Text>
                  You are about to <strong>BURN PERMANENTLY</strong>{' '}
                  <strong>{burnCount}</strong> {burnCount === 1 ? 'unit' : 'units'} of{' '}
                  <strong>"{asset.name}"</strong>.
                </Text>
                {burnOption === 'all' && (
                  <Alert status="warning" rounded="md" fontSize="sm">
                    <AlertIcon />
                    <Text>
                      This will remove <strong>ALL</strong> the copies of this asset.
                    </Text>
                  </Alert>
                )}
                <Text fontWeight="bold" color="red.500">
                  This action cannot be undone.
                </Text>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmBurn} ml={3}>
                Yes, burn {burnCount}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default BurnModal;
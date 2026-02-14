// src/components/creator/RestockDemoModal.tsx
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Alert,
  AlertIcon,
  Divider,
} from '@chakra-ui/react';
import { RepeatIcon, TimeIcon } from '@chakra-ui/icons';
import { GroupedAsset } from '../../hooks/useStock';
import { DemoProduct } from '../../hooks/useDemoProducts';
import { useDemo } from '../../hooks/useDemo';

interface RestockDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: GroupedAsset;
  demoProduct: DemoProduct;
  onSuccess: () => void;
}

const formatPeriod = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
  return `${(seconds / 86400).toFixed(1)}d`;
};

const RestockDemoModal: React.FC<RestockDemoModalProps> = ({
  isOpen,
  onClose,
  asset,
  demoProduct,
  onSuccess,
}) => {
  const toast = useToast();
  const { restockDemoProduct, loading } = useDemo();

  const [amount, setAmount] = useState<number>(1);

  const sortedIds = useMemo(() => [...asset.ids].sort((a, b) => a - b), [asset.ids]);
  const referenceNftId = sortedIds[0];
  const availableIds = sortedIds.slice(1);
  const maxStock = availableIds.length;

  const idsToSend = useMemo(() => {
    return availableIds.slice(0, amount);
  }, [availableIds, amount]);

  const getImageUrl = (img: string): string => {
    if (!img) return '/placeholder-image.png';
    if (img.startsWith('ipfs://')) {
      const cid = img.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${cid}`;
    }
    return img;
  };

  const handleRestock = async () => {
    if (idsToSend.length === 0) return;

    const result = await restockDemoProduct(idsToSend, demoProduct.int_ref);

    if (result.success) {
      toast({
        title: 'Stock replenished',
        description: `${idsToSend.length} NFT(s) sent to demo contract.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onSuccess();
    } else {
      toast({
        title: 'Restock error',
        description: result.error,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnOverlayClick={!loading}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Text>Restock Demo</Text>
            <Badge colorScheme="cyan">Demo</Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={loading} />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <HStack spacing={3}>
              <Image
                src={getImageUrl(asset.image)}
                alt={asset.name}
                boxSize="60px"
                objectFit="cover"
                rounded="md"
              />
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold">{demoProduct.product}</Text>
                <HStack fontSize="sm" color="gray.500">
                  <TimeIcon boxSize={3} />
                  <Text>Period: {formatPeriod(demoProduct.period)}</Text>
                </HStack>
                <Text fontSize="xs" color="gray.400">
                  int_ref: {demoProduct.int_ref}
                </Text>
              </VStack>
            </HStack>

            <Divider />

            <Alert status="info" rounded="md" fontSize="sm">
              <AlertIcon />
              <Text>
                Reference ID: {referenceNftId} · Available to send: {maxStock}
              </Text>
            </Alert>

            <FormControl isRequired>
              <FormLabel>Amount to send</FormLabel>
              <NumberInput
                value={amount}
                onChange={(_, val) => setAmount(val || 1)}
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
                IDs: {idsToSend.slice(0, 5).join(', ')}
                {idsToSend.length > 5 && ` ... (+${idsToSend.length - 5} more)`}
              </FormHelperText>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose} isDisabled={loading}>
              Cancel
            </Button>
            <Button
              colorScheme="cyan"
              onClick={handleRestock}
              isDisabled={maxStock === 0 || loading}
              isLoading={loading}
              leftIcon={<RepeatIcon />}
            >
              Send {amount} NFT(s)
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RestockDemoModal;
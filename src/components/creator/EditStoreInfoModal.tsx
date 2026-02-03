// src/components/creator/EditStoreInfoModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { GameMetadata } from '../../hooks/useStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  currentMetadata: GameMetadata;
  onSave: (name: string, data: GameMetadata) => void;
}

// IMPORTANTE: Se añade 'export' al inicio del componente
export const EditStoreInfoModal: React.FC<Props> = ({
  isOpen,
  onClose,
  productName,
  currentMetadata,
  onSave,
}) => {
  const [formData, setFormData] = useState<GameMetadata>(currentMetadata);
  const bg = useColorModeValue('white', 'gray.800');

  // Sincronizar el estado interno cuando cambia el producto seleccionado
  useEffect(() => {
    if (isOpen) {
      setFormData(currentMetadata);
    }
  }, [isOpen, currentMetadata]);

  const handleSave = () => {
    onSave(productName, formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={bg}>
        <ModalHeader borderBottomWidth="1px">
          Editar Información Store: {productName}
        </ModalHeader>
        <ModalBody>
          <VStack spacing={4} mt={4}>
            <FormControl>
              <FormLabel fontWeight="bold">Descripción Corta</FormLabel>
              <Input
                placeholder="Resumen rápido para la tarjeta de la tienda"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="bold">Descripción Larga (Markdown)</FormLabel>
              <Textarea
                placeholder="Explica todos los detalles de tu juego..."
                h="150px"
                value={formData.longDescription}
                onChange={(e) =>
                  setFormData({ ...formData, longDescription: e.target.value })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="bold">Imagen de Portada (Steam style)</FormLabel>
              <Input
                placeholder="URL de la imagen principal"
                value={formData.coverImage}
                onChange={(e) =>
                  setFormData({ ...formData, coverImage: e.target.value })
                }
              />
            </FormControl>

            <SimpleGrid columns={2} spacing={4} w="100%">
              {[0, 1, 2, 3].map((i) => (
                <FormControl key={i}>
                  <FormLabel fontSize="sm">Preview Image {i + 1}</FormLabel>
                  <Input
                    placeholder="https://..."
                    value={formData.previews[i] || ''}
                    onChange={(e) => {
                      const newPreviews = [...formData.previews];
                      newPreviews[i] = e.target.value;
                      setFormData({ ...formData, previews: newPreviews });
                    }}
                  />
                </FormControl>
              ))}
            </SimpleGrid>

            <FormControl>
              <FormLabel fontWeight="bold">YouTube Video URL</FormLabel>
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.videoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, videoUrl: e.target.value })
                }
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" mt={4}>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            Guardar Cambios
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditStoreInfoModal;
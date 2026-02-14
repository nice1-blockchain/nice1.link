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
  useToast,
} from '@chakra-ui/react';
import { useAnchor } from '@nice1/react-tools';
import { GameMetadata } from '../../hooks/useStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productOwner: string;
  currentMetadata: GameMetadata;
  onSave: (name: string, data: GameMetadata) => void;
}

// IMPORTANTE: Se añade 'export' al inicio del componente
export const EditStoreInfoModal: React.FC<Props> = ({
  isOpen,
  onClose,
  productName,
  productOwner,
  currentMetadata,
  onSave,
}) => {
  const { session } = useAnchor();
  const toast = useToast();
  const [formData, setFormData] = useState<GameMetadata>(currentMetadata);
  const [saving, setSaving] = useState(false);
  const bg = useColorModeValue('white', 'gray.800');

  // Sincronizar el estado interno cuando cambia el producto seleccionado
  useEffect(() => {
    if (isOpen) {
      setFormData(currentMetadata);
    }
  }, [isOpen, currentMetadata]);

  const handleSave = async () => {
    if (!session) {
      toast({
        title: 'Wallet no conectada',
        description: 'Conecta tu wallet para guardar cambios.',
        status: 'warning',
      });
      return;
    }

    const currentUser = session.auth.actor.toString();

    // 1. Verificar que el usuario logueado es el productowner
    if (currentUser !== productOwner) {
      toast({
        title: 'Sin permisos',
        description: `Solo el owner (${productOwner}) puede editar este producto.`,
        status: 'error',
      });
      return;
    }

    setSaving(true);

    try {
      // 2. Pedir firma de wallet para autenticar la acción
      //    Usamos una transferencia de 0 tokens a sí mismo como "proof of ownership"
      //    Alternativa: si tienes un contrato con acción de metadata, úsalo aquí
      const action = {
        account: 'eosio.token',
        name: 'transfer',
        authorization: [
          {
            actor: currentUser,
            permission: session.auth.permission.toString(),
          },
        ],
        data: {
          from: currentUser,
          to: currentUser,
          quantity: '0.00000000 WAX',
          memo: `n1store:update:${productName}`,
        },
      };

      const result = await session.transact(
        { actions: [action] },
        { broadcast: true }
      );

      console.log('✅ Autenticación de ownership exitosa:', result);

      // 3. Solo si la firma fue exitosa, guardar los metadatos
      onSave(productName, formData);

      toast({
        title: 'Cambios guardados',
        description: 'La información de la tienda se ha actualizado correctamente.',
        status: 'success',
      });

      onClose();
    } catch (err: any) {
      console.error('❌ Error al autenticar:', err);

      // Si el usuario cancela la firma, no guardar nada
      toast({
        title: 'No se guardaron los cambios',
        description:
          err?.message?.includes('cancel') || err?.message?.includes('rejected')
            ? 'Firma cancelada por el usuario.'
            : `Error: ${err?.message || 'desconocido'}`,
        status: 'error',
      });
    } finally {
      setSaving(false);
    }
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

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={saving}>
            Cancelar
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={saving}
            loadingText="Firmando..."
          >
            Guardar Cambios
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditStoreInfoModal;
// src/pages/creator/ModifyPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Stack,
  Input,
  Select,
  useColorModeValue,
  useToast,
  HStack,
  IconButton,
  Image,
  Badge,
  VStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStock } from '../../hooks/useStock';
import { useModify } from '../../hooks/useModify';

interface KV {
  id: string;
  key: string;
  value: string;
}

const navigate = useNavigate();

// Hook para generar IDs únicos
const useIdGen = () => {
  let counter = 0;
  return () => `kv-${Date.now()}-${counter++}`;
};

const kvToObject = (list: KV[]) =>
  list
    .filter((it) => it.key.trim() !== '')
    .reduce<Record<string, string>>((acc, it) => {
      acc[it.key.trim()] = it.value;
      return acc;
    }, {});

const ModifyPage: React.FC = () => {
  const border = useColorModeValue('gray.200', 'whiteAlpha.200');
  const bg = useColorModeValue('white', 'gray.800');
  const mdataBg = useColorModeValue('gray.50', 'gray.700');
  const toast = useToast();

  const [searchParams] = useSearchParams();
  const { groupedAssets, loading: loadingAssets } = useStock();
  const { modifyAsset, loading: modifying } = useModify();

  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [mdataFields, setMdataFields] = useState<KV[]>([]);
  const newId = useIdGen();

  // Leer el ID de la URL al cargar (cuando los assets estén listos)
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl && groupedAssets.length > 0 && !selectedAssetId) {
      // Verificar que el ID existe en los assets
      const exists = groupedAssets.some((asset) =>
        asset.ids.some((id) => id.toString() === idFromUrl)
      );
      if (exists) {
        setSelectedAssetId(idFromUrl);
      }
    }
  }, [searchParams, groupedAssets, selectedAssetId]);

  // Asset seleccionado
  const selectedAsset = useMemo(() => {
    if (!selectedAssetId) return null;
    return groupedAssets.find((asset) =>
      asset.ids.some((id) => id.toString() === selectedAssetId)
    );
  }, [selectedAssetId, groupedAssets]);

  // ID numérico del asset
  const assetIdNum = useMemo(() => {
    return selectedAssetId ? parseInt(selectedAssetId) : null;
  }, [selectedAssetId]);

  // Cargar mdata actual cuando se selecciona un asset
  useEffect(() => {
    if (selectedAsset && selectedAsset.mdata) {
      const entries = Object.entries(selectedAsset.mdata).map(([key, value]) => ({
        id: newId(),
        key,
        value: String(value),
      }));
      setMdataFields(entries);
    } else {
      setMdataFields([]);
    }
  }, [selectedAsset]);

  const addField = () => {
    setMdataFields([...mdataFields, { id: newId(), key: '', value: '' }]);
  };

  const removeField = (id: string) => {
    setMdataFields(mdataFields.filter((f) => f.id !== id));
  };

  const editField = (id: string, patch: Partial<KV>) => {
    const updated = mdataFields.map((f) => (f.id === id ? { ...f, ...patch } : f));
    setMdataFields(updated);
  };

  const handleModify = async () => {
    if (!assetIdNum) {
      toast({
        title: 'Error',
        description: 'Selecciona un asset para modificar',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Construir nuevo mdata
    const newMdata = {
      img: selectedAsset?.mdata?.img || '', // Mantener img original
      ...kvToObject(mdataFields),
    };

    console.log('📦 Nuevo mdata:', newMdata);

    const result = await modifyAsset({
      assetid: assetIdNum,
      mdata: newMdata,
    });

    if (result.success) {
      toast({
        title: 'Asset successfully modified!',
        description: `The asset was updated #${assetIdNum}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });

      setTimeout(() => navigate('/creator/stock'), 1500);
    } else {
      toast({
        title: 'Error al modificar asset',
        description: result.error || 'Error desconocido',
        status: 'error',
        duration: 8000,
        isClosable: true,
        position: 'top-right',
      });
    }
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
    <Box flex="1" p={{ base: 0, md: 2 }}>
      <Box bg={bg} borderWidth="1px" borderColor={border} rounded="lg" p={6}>
        <Heading size="md" mb={4}>
          Modify - Edit Asset
        </Heading>

        <Stack spacing={6} maxW="820px">
          {/* Seleccionar Asset */}
          <Box>
            <Text fontWeight="semibold" mb={2}>
              Select the asset to modify:
            </Text>
            <Select
              placeholder="-- Select an asset --"
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              isDisabled={loadingAssets}
            >
              {groupedAssets.map((asset) =>
                asset.ids.map((id) => (
                  <option key={id} value={id.toString()}>
                    #{id} - {asset.name} ({asset.category})
                  </option>
                ))
              )}
            </Select>
            {loadingAssets && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                Cargando assets...
              </Text>
            )}
          </Box>

          {/* Preview del Asset Seleccionado */}
          {selectedAsset && (
            <Box borderWidth="1px" borderColor={border} rounded="md" p={4}>
              <Text fontWeight="bold" mb={3}>
                Asset Selected:
              </Text>
              <HStack spacing={4} align="start">
                <Image
                  src={getImageUrl(selectedAsset.image)}
                  alt={selectedAsset.name}
                  boxSize="100px"
                  objectFit="cover"
                  rounded="md"
                  fallbackSrc="https://via.placeholder.com/100?text=No+Image"
                />
                <VStack align="start" flex="1" spacing={1}>
                  <Text fontSize="lg" fontWeight="bold">
                    {selectedAsset.name}
                  </Text>
                  <HStack>
                    <Badge colorScheme="blue">{selectedAsset.category}</Badge>
                    <Badge colorScheme="teal">ID: {assetIdNum}</Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    Author: {selectedAsset.author}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {selectedAsset.copyCount} {selectedAsset.copyCount === 1 ? 'unit' : 'units'}
                  </Text>
                </VStack>
              </HStack>

              {/* Mostrar mdata actual */}
              <Box mt={4} p={3} bg={mdataBg} rounded="md" fontSize="xs">
                <Text fontWeight="bold" mb={1}>
                  mdata:
                </Text>
                <Text fontFamily="mono">{JSON.stringify(selectedAsset.mdata, null, 2)}</Text>
              </Box>
            </Box>
          )}

          {/* Campos Mutables */}
          {selectedAsset && (
            <Box>
              <Text fontWeight="semibold" mb={2}>
                Campos mutables (mdata):
              </Text>
              <Alert status="info" mb={3} fontSize="sm">
                <AlertIcon />
                You can only modify the <strong>mutable fields (mdata)</strong>. The immutable fields (idata) cannot be changed.
              </Alert>

              <Stack spacing={3}>
                {mdataFields.map((field) => (
                  <HStack key={field.id} align="stretch">
                    <Input
                      value={field.key}
                      placeholder="Field (ej. color)"
                      onChange={(e) => editField(field.id, { key: e.target.value })}
                    />
                    <Input
                      value={field.value}
                      placeholder="Valor (ej. rojo)"
                      onChange={(e) => editField(field.id, { value: e.target.value })}
                    />
                    <IconButton
                      aria-label="Delete"
                      icon={<CloseIcon boxSize="2" />}
                      variant="ghost"
                      borderWidth="1px"
                      borderColor={border}
                      onClick={() => removeField(field.id)}
                    />
                  </HStack>
                ))}
                <Button size="sm" onClick={addField} alignSelf="flex-start">
                  + Add filed
                </Button>
              </Stack>
            </Box>
          )}

          {/* Botones */}
          <HStack spacing={3}>
            <Button
              colorScheme="teal"
              onClick={handleModify}
              isLoading={modifying}
              loadingText="Modifying..."
              isDisabled={!selectedAsset}
            >
              Modify Asset
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedAssetId('');
                setMdataFields([]);
              }}
              isDisabled={modifying}
            >
              Clean
            </Button>
          </HStack>

          {!selectedAsset && (
            <Text fontSize="sm" color="gray.500" fontStyle="italic">
              Select an asset to begin editing its mutable fields.
            </Text>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default ModifyPage;
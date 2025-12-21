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
  AlertDescription,
  Progress,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStock, GroupedAsset } from '../../hooks/useStock';
import { useModifyBatch } from '../../hooks/useModifyBatch';

interface KV {
  id: string;
  key: string;
  value: string;
}

// Generador de IDs únicos
let idCounter = 0;
const newId = () => `kv-${Date.now()}-${idCounter++}`;

const kvToObject = (list: KV[]) =>
  list
    .filter((it) => it.key.trim() !== '')
    .reduce<Record<string, string>>((acc, it) => {
      acc[it.key.trim()] = it.value;
      return acc;
    }, {});

const ModifyPage: React.FC = () => {
  const navigate = useNavigate();
  const border = useColorModeValue('gray.200', 'whiteAlpha.200');
  const bg = useColorModeValue('white', 'gray.800');
  const mdataBg = useColorModeValue('gray.50', 'gray.700');
  const toast = useToast();

  const [searchParams] = useSearchParams();
  const { groupedAssets, loading: loadingAssets, reload } = useStock();
  const { modifyBatch, loading: modifying, progress, resetProgress, BATCH_SIZE } = useModifyBatch();

  // Selección por asset agrupado (nombre-categoría), NO por ID individual
  const [selectedAssetKey, setSelectedAssetKey] = useState<string>('');
  const [mdataFields, setMdataFields] = useState<KV[]>([]);

  // Leer el ID de la URL y encontrar el asset agrupado correspondiente
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl && groupedAssets.length > 0 && !selectedAssetKey) {
      // Buscar el asset que contiene este ID
      const asset = groupedAssets.find((a) =>
        a.ids.some((id) => id.toString() === idFromUrl)
      );
      if (asset) {
        const key = `${asset.name}-${asset.category}`;
        setSelectedAssetKey(key);
      }
    }
  }, [searchParams, groupedAssets, selectedAssetKey]);

  // Asset seleccionado (agrupado)
  const selectedAsset = useMemo((): GroupedAsset | null => {
    if (!selectedAssetKey) return null;
    return groupedAssets.find(
      (asset) => `${asset.name}-${asset.category}` === selectedAssetKey
    ) || null;
  }, [selectedAssetKey, groupedAssets]);

  // Cargar mdata cuando se selecciona un asset (sin incluir 'img')
  useEffect(() => {
    if (selectedAsset && selectedAsset.mdata) {
      const entries = Object.entries(selectedAsset.mdata)
        .filter(([key]) => key !== 'img') // img se mantiene automáticamente
        .map(([key, value]) => ({
          id: newId(),
          key,
          value: String(value),
        }));
      setMdataFields(entries);
    } else {
      setMdataFields([]);
    }
  }, [selectedAsset]);

  // Calcular info de transacciones
  const transactionInfo = useMemo(() => {
    if (!selectedAsset) return null;
    const totalIds = selectedAsset.ids.length;
    const totalBatches = Math.ceil(totalIds / BATCH_SIZE);
    return { totalIds, totalBatches };
  }, [selectedAsset, BATCH_SIZE]);

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
    if (!selectedAsset) {
      toast({
        title: 'Error',
        description: 'Selecciona un asset para modificar',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Construir nuevo mdata (mantener img original)
    const newMdata = {
      img: selectedAsset.mdata?.img || '',
      ...kvToObject(mdataFields),
    };

    console.log('📦 Nuevo mdata a aplicar a todos los IDs:', newMdata);
    console.log('🎯 IDs a modificar:', selectedAsset.ids);

    const result = await modifyBatch(selectedAsset.ids, newMdata);

    if (result.success) {
      toast({
        title: '¡Assets modificados exitosamente!',
        description: `Se actualizaron ${result.totalModified} unidades en ${result.transactionIds.length} transacción(es)`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });

      // Recargar assets y volver a stock
      await reload();
      setTimeout(() => navigate('/creator/stock'), 2000);
    } else {
      toast({
        title: 'Error al modificar assets',
        description: result.error || 'Error desconocido',
        status: 'error',
        duration: 8000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const handleCancel = () => {
    setSelectedAssetKey('');
    setMdataFields([]);
    resetProgress();
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

  // Progress percentage
  const progressPercent = progress.totalActions > 0
    ? (progress.completedActions / progress.totalActions) * 100
    : 0;

  return (
    <Box flex="1" p={{ base: 0, md: 2 }}>
      <Box bg={bg} borderWidth="1px" borderColor={border} rounded="lg" p={6}>
        <Heading size="md" mb={4}>
          Modificar - Editar Asset
        </Heading>

        <Stack spacing={6} maxW="820px">
          {/* Seleccionar Asset (por nombre-categoría, SIN IDs) */}
          <Box>
            <Text fontWeight="semibold" mb={2}>
              Selecciona el asset a modificar:
            </Text>
            <Select
              placeholder="-- Seleccionar asset --"
              value={selectedAssetKey}
              onChange={(e) => {
                setSelectedAssetKey(e.target.value);
                resetProgress();
              }}
              isDisabled={loadingAssets || modifying}
            >
              {groupedAssets.map((asset) => {
                const key = `${asset.name}-${asset.category}`;
                return (
                  <option key={key} value={key}>
                    {asset.name} ({asset.category}) - {asset.copyCount} unidad{asset.copyCount !== 1 ? 'es' : ''}
                  </option>
                );
              })}
            </Select>
            {loadingAssets && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                Cargando assets...
              </Text>
            )}
          </Box>

          {/* Preview del Asset Seleccionado (sin ID) */}
          {selectedAsset && (
            <Box borderWidth="1px" borderColor={border} rounded="md" p={4}>
              <Text fontWeight="bold" mb={3}>
                Asset Seleccionado:
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
                    <Badge colorScheme="purple">
                      {selectedAsset.copyCount} unidad{selectedAsset.copyCount !== 1 ? 'es' : ''}
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    Author: {selectedAsset.author}
                  </Text>
                </VStack>
              </HStack>

              {/* Info de transacciones necesarias */}
              {transactionInfo && (
                <Alert status="info" mt={4} rounded="md" fontSize="sm">
                  <AlertIcon />
                  <AlertDescription>
                    <Text>
                      <strong>Total de unidades:</strong> {transactionInfo.totalIds}
                    </Text>
                    <Text>
                      <strong>Transacciones necesarias:</strong> {transactionInfo.totalBatches}
                      {transactionInfo.totalBatches > 1 && ` (máx. ${BATCH_SIZE} acciones por transacción)`}
                    </Text>
                    {transactionInfo.totalBatches > 1 && (
                      <Text color="orange.600" fontWeight="medium" mt={1}>
                        ⚠️ Cada transacción requiere una firma. Se procesarán en cola.
                      </Text>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Mostrar mdata actual */}
              <Box mt={4} p={3} bg={mdataBg} rounded="md" fontSize="xs">
                <Text fontWeight="bold" mb={1}>
                  mdata actual:
                </Text>
                <Text fontFamily="mono" whiteSpace="pre-wrap">
                  {JSON.stringify(selectedAsset.mdata, null, 2)}
                </Text>
              </Box>
            </Box>
          )}

          {/* Campos Mutables */}
          {selectedAsset && (
            <Box>
              <Text fontWeight="semibold" mb={2}>
                Campos mutables (mdata):
              </Text>
              <Alert status="warning" mb={3} fontSize="sm">
                <AlertIcon />
                Solo puedes modificar los <strong>campos mutables (mdata)</strong>. 
                Los campos inmutables (idata) no se pueden cambiar.
                La imagen (img) se mantiene automáticamente.
              </Alert>

              <Stack spacing={3}>
                {mdataFields.map((field) => (
                  <HStack key={field.id} align="stretch">
                    <Input
                      value={field.key}
                      placeholder="Campo (ej. level)"
                      onChange={(e) => editField(field.id, { key: e.target.value })}
                      isDisabled={modifying}
                    />
                    <Input
                      value={field.value}
                      placeholder="Valor (ej. 5)"
                      onChange={(e) => editField(field.id, { value: e.target.value })}
                      isDisabled={modifying}
                    />
                    <IconButton
                      aria-label="Eliminar"
                      icon={<CloseIcon boxSize="2" />}
                      variant="ghost"
                      borderWidth="1px"
                      borderColor={border}
                      onClick={() => removeField(field.id)}
                      isDisabled={modifying}
                    />
                  </HStack>
                ))}
                <Button size="sm" onClick={addField} alignSelf="flex-start" isDisabled={modifying}>
                  + Añadir campo
                </Button>
              </Stack>
            </Box>
          )}

          {/* Barra de progreso durante modificación */}
          {modifying && progress.status !== 'idle' && (
            <Box>
              <Text fontSize="sm" mb={2}>
                {progress.status === 'awaiting_signature' && (
                  <>🔐 Esperando firma para lote {progress.currentBatch}/{progress.totalBatches}...</>
                )}
                {progress.status === 'processing' && (
                  <>⏳ Procesando lote {progress.currentBatch}/{progress.totalBatches}...</>
                )}
                {progress.status === 'completed' && <>✅ ¡Completado!</>}
                {progress.status === 'error' && <>❌ Error: {progress.error}</>}
              </Text>
              <Progress
                value={progressPercent}
                size="sm"
                colorScheme={
                  progress.status === 'error'
                    ? 'red'
                    : progress.status === 'completed'
                    ? 'green'
                    : 'teal'
                }
                hasStripe
                isAnimated={modifying}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                {progress.completedActions} / {progress.totalActions} acciones completadas
              </Text>
            </Box>
          )}

          {/* Botones */}
          <HStack spacing={3}>
            <Button
              colorScheme="teal"
              onClick={handleModify}
              isLoading={modifying}
              loadingText={
                progress.status === 'awaiting_signature'
                  ? `Firma lote ${progress.currentBatch}...`
                  : 'Modificando...'
              }
              isDisabled={!selectedAsset}
            >
              Modificar Asset
              {transactionInfo && transactionInfo.totalBatches > 1 && (
                <Badge ml={2} colorScheme="orange">
                  {transactionInfo.totalBatches} firmas
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              isDisabled={modifying}
            >
              Limpiar
            </Button>
          </HStack>

          {!selectedAsset && (
            <Text fontSize="sm" color="gray.500" fontStyle="italic">
              Selecciona un asset para comenzar a editar sus campos mutables.
            </Text>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default ModifyPage;
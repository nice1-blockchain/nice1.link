// src/pages/creator/CreatorPage.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
  Button,
  Input,
  useColorModeValue,
  RadioGroup,
  Radio,
  HStack,
  Link,
  IconButton,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useAnchor } from "@nice1/react-tools";
import { asString } from "../../utils/asstring";
import { useCreatorContract } from "../../hooks/useCreatorContract";
import { useStockContext } from "../../contexts/StockContext";

/* ----------------------------- Helpers de formato ---------------------------- */
/**
 * Normaliza el texto a: sin acentos/diacríticos, sin símbolos, espacios simples,
 * todo en minúscula, y devuelve con primera letra en mayúscula.
 * (Compatible con target ES5: NO usa \p{…} ni flag 'u')
 */
const toPrimeraMayus = (s: string): string => {
  const sinDiacriticos = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const soloAlfaNumEsp = sinDiacriticos.replace(/[^A-Za-z0-9\s]+/g, " ");
  const compactado = soloAlfaNumEsp.replace(/\s+/g, " ").trim().toLowerCase();
  return compactado ? compactado.charAt(0).toUpperCase() + compactado.slice(1) : "";
};

/** Para "custom": una sola palabra capitalizada */
const toCapitalizedWord = (s: string): string => {
  const sinDiacriticos = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const soloAlfaNumEsp = sinDiacriticos.replace(/[^A-Za-z0-9\s]+/g, " ");
  const first = (soloAlfaNumEsp.trim().split(/\s+/)[0] || "").toLowerCase();
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : "";
};

/** Generador de ids simple (evita depender de crypto.randomUUID) */
const useIdGen = () => {
  const c = useRef(0);
  return () => `${Date.now().toString(36)}-${(c.current++).toString(36)}`;
};

/* --------------------------- Lista Field | Valor UI -------------------------- */
type KV = { id: string; key: string; value: string };

interface KeyValueListProps {
  items: KV[];
  onChange: (items: KV[]) => void;
  placeholderKey?: string;
  placeholderValue?: string;
}

const KeyValueList = ({ 
  items, 
  onChange, 
  placeholderKey = "Field", 
  placeholderValue = "Valor" 
}: KeyValueListProps) => {
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const newId = useIdGen();

  const add = () => onChange([...items, { id: newId(), key: "", value: "" }]);
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const edit = (id: string, patch: Partial<KV>) => {
    const updated = items.map((i) => (i.id === id ? { ...i, ...patch } : i));
    onChange(updated);
  };

  return (
    <Stack spacing={3}>
      {items.map((row) => (
        <HStack key={row.id} align="stretch">
          <Input
            value={row.key}
            placeholder={placeholderKey}
            onChange={(e) => edit(row.id, { key: e.target.value })}
          />
          <Input
            value={row.value}
            placeholder={placeholderValue}
            onChange={(e) => edit(row.id, { value: e.target.value })}
          />
          <IconButton
            aria-label="Eliminar"
            icon={<CloseIcon boxSize="2" />}
            variant="ghost"
            borderWidth="1px"
            borderColor={border}
            onClick={() => remove(row.id)}
          />
        </HStack>
      ))}
      <Button size="sm" onClick={add} alignSelf="flex-start">
        + New field
      </Button>
    </Stack>
  );
};

/* --------------------------------- Create UI -------------------------------- */
type AssetType = "license" | "skin" | "asset" | "custom";
type ImageMode = "ipfs" | "url";

// TODO: sustituir por URLs reales de documentación
const INMUTABLE_DOC_URL = "https://nice1.link/docs/datos-inmutables";
const MUTABLE_DOC_URL = "https://nice1.link/docs/datos-mutables";

const kvToObject = (list: KV[]) =>
  list
    .filter((it) => it.key.trim() !== "")
    .reduce<Record<string, string>>((acc, it) => {
      acc[it.key.trim()] = it.value;
      return acc;
    }, {});

const CreatorPage: React.FC = () => {
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const bg = useColorModeValue("white", "gray.800");
  const toast = useToast();

  const { account } = useAnchor();
  const author = asString(account?.account_name);
  
  // Hook del contrato
  const { createAsset, loading, error, clearError } = useCreatorContract();
  
  // Contexto compartido para recargar el sidebar después de crear
  const { reload: reloadStock } = useStockContext();

  const [assetType, setAssetType] = useState<AssetType>("license");

  // Nombre: siempre 1ª en mayúscula, resto en minúscula
  const [nameRaw, setNameRaw] = useState<string>("");
  const name = useMemo<string>(() => toPrimeraMayus(nameRaw), [nameRaw]);

  const [imageMode, setImageMode] = useState<ImageMode>("ipfs");
  const [imageValue, setImageValue] = useState<string>("");

  // Normalización de imagen
  const ipfsValue = useMemo<string>(() => {
    if (!imageValue) return "";
    return imageValue.startsWith("ipfs://") ? imageValue : `ipfs://${imageValue}`;
  }, [imageValue]);

  const imageNormalized: string = useMemo(() => {
    return imageMode === "ipfs" ? ipfsValue : imageValue;
  }, [imageMode, ipfsValue, imageValue]);

  const [idataExtras, setIdataExtras] = useState<KV[]>([]);
  const [mdataExtras, setMdataExtras] = useState<KV[]>([]);

  // Validaciones
  const isFormValid = useMemo(() => {
    if (!author) return false;
    if (!name.trim()) return false;
    if (!imageNormalized.trim()) return false;
    return true;
  }, [author, name, imageNormalized, assetType]);

  const limpiarFormulario = () => {
    setAssetType("license");
    setNameRaw("");
    setImageMode("ipfs");
    setImageValue("");
    setIdataExtras([]);
    setMdataExtras([]);
    clearError();
  };

  const onCreate = async () => {
    if (!author || !isFormValid) return;

    const category = assetType === "custom" ? "custom" : assetType;
    const idata = { name, ...kvToObject(idataExtras) };
    const mdata = { img: imageNormalized, ...kvToObject(mdataExtras) };

    const payload = {
      author,
      owner: author,
      category,
      idata,
      mdata,
      requireclaim: false,
    };

    console.log("📦 Payload completo:", payload);

    const result = await createAsset(payload);

    if (result.success) {
      toast({
        title: "¡Activo creado exitosamente!",
        description: `Se ha creado "${name}" (${category})`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });

      // Limpiar formulario después de éxito
      limpiarFormulario();
      
      // Recargar el stock compartido (actualiza el sidebar automáticamente)
      setTimeout(async () => {
        await reloadStock();
      }, 1500);
    } else {
      toast({
        title: "Error al crear activo",
        description: result.error || "Ocurrió un error desconocido",
        status: "error",
        duration: 8000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  return (
    <Box flex="1" p={{ base: 0, md: 2 }}>
      <Box bg={bg} borderWidth="1px" borderColor={border} rounded="lg" p={6}>
        <Heading size="md" mb={4}>
          Create
        </Heading>

        {/* Alert de error persistente */}
        {error && (
          <Alert status="error" mb={4} rounded="md">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Error en la transacción</AlertTitle>
              <AlertDescription display="block" fontSize="sm">
                {error}
              </AlertDescription>
            </Box>
            <CloseButton
              alignSelf="flex-start"
              position="relative"
              right={-1}
              top={-1}
              onClick={clearError}
            />
          </Alert>
        )}

        {/* Alert si no hay wallet conectado */}
        {!author && (
          <Alert status="warning" mb={4} rounded="md">
            <AlertIcon />
            <AlertDescription>
              Conecta tu wallet para poder crear activos.
            </AlertDescription>
          </Alert>
        )}

        <Stack spacing={6} maxW="820px">
          {/* Tipo de activo */}
          <Box>
            <Text fontWeight="semibold" mb={2}>
              Select 1 "Asset" to create:
            </Text>
            <RadioGroup
              value={assetType}
              onChange={(v) => setAssetType(v as AssetType)}
            >
              <HStack spacing={6}>
                <Radio value="license">License</Radio>
                <Radio value="skin">Skin</Radio>
                <Radio value="asset">Asset</Radio>
                <Radio value="custom">Custom</Radio>
              </HStack>
            </RadioGroup>

          </Box>

          {/* Nombre */}
          <Box>
            <Text fontWeight="semibold" mb={2}>
              Name <Text as="span" color="red.500">*</Text>
            </Text>
            <Input
              placeholder="Enter the name of the Game, Skin, or Asset you want to create"
              value={nameRaw}
              onChange={(e) => setNameRaw(e.target.value)}
            />
            <Text fontSize="sm" mt={2}>
              Format applied automatically: <b>{name || "—"}</b>
            </Text>
          </Box>

          {/* Imagen */}
          <Box>
            <Text fontWeight="semibold" mb={2}>
              Representative image of the "Asset" <Text as="span" color="red.500">*</Text>
            </Text>
            <RadioGroup
              value={imageMode}
              onChange={(v) => setImageMode(v as ImageMode)}
            >
              <HStack spacing={6} mb={2}>
                <Radio value="ipfs">IPFS (CID o ipfs://CID)</Radio>
                <Radio value="url">URL</Radio>
              </HStack>
            </RadioGroup>
            <Input
              placeholder={
                imageMode === "ipfs"
                  ? "CID o ipfs://<cid>"
                  : "https://example.com/imagen.png"
              }
              value={imageValue}
              onChange={(e) => setImageValue(e.target.value)}
            />
            <Text fontSize="xs" opacity={0.7} mt={1}>
              We will save in <code>mdata.img</code>:{" "}
              <b>{imageNormalized || "—"}</b>
            </Text>
          </Box>

          {/* Extras inmutables */}
          <Box>
            <Text fontWeight="semibold">
              Do you need to add an extra immutable value?
            </Text>
            <Text fontSize="sm" mb={2}>
              <em>* </em>
              <Link href={INMUTABLE_DOC_URL} isExternal color="teal.500">
                Read more about extra immutable data
              </Link>
            </Text>
            <KeyValueList
              items={idataExtras}
              onChange={setIdataExtras}
              placeholderKey="Field (ej. rarity)"
              placeholderValue="Valor (ej. legendary)"
            />
          </Box>

          {/* Extras mutables */}
          <Box>
            <Text fontWeight="semibold">
              Do you need to add an extra mutable value?
            </Text>
            <Text fontSize="sm" mb={2}>
              <em>* </em>
              <Link href={MUTABLE_DOC_URL} isExternal color="teal.500">
                Read more about extra mutable data
              </Link>
            </Text>
            <KeyValueList
              items={mdataExtras}
              onChange={setMdataExtras}
              placeholderKey="Field (ej. color)"
              placeholderValue="Valor (ej. rojo)"
            />
          </Box>

          {/* Botonera */}
          <HStack spacing={3} flexWrap="wrap">
            <Button
              colorScheme="teal"
              onClick={onCreate}
              isDisabled={!isFormValid}
              isLoading={loading}
              loadingText="Creating..."
            >
              Create {assetType}
            </Button>
            <Button variant="outline" onClick={limpiarFormulario} isDisabled={loading}>
              Clear
            </Button>
          </HStack>

          {/* Technical info */}
          <Text fontSize="xs" opacity={0.7}>
            <code>idata.name = "{name}"</code> |
            <code> mdata.img = "{imageNormalized}"</code>
            {assetType === "custom" && ` | tipo custom = "${assetType}"`}
          </Text>
        </Stack>
      </Box>
    </Box>
  );
};

export default CreatorPage;
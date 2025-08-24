import React, { useMemo, useRef, useState } from "react";
import {
  Box, Heading, Text, Stack, Button, Input, Textarea,
  useColorModeValue, RadioGroup, Radio, HStack, Link, IconButton,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

/* ----------------------------- Helpers de formato ---------------------------- */
const toPrimeraMayus = (s: string) => {
  const clean = s.normalize("NFKD").replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ").trim().toLowerCase();
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : "";
};

const toCapitalizedWord = (s: string) => {
  const word = (s.normalize("NFKD").replace(/[^\p{L}\p{N}\s]+/gu, " ").trim().split(/\s+/)[0] || "").toLowerCase();
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : "";
};

const useIdGen = () => { const c = useRef(0); return () => `${Date.now().toString(36)}-${(c.current++).toString(36)}`; };

/* --------------------------- Lista Field | Valor UI -------------------------- */
type KV = { id: string; key: string; value: string };

const KeyValueList: React.FC<{
  items: KV[]; onChange: (items: KV[]) => void;
  placeholderKey?: string; placeholderValue?: string;
}> = ({ items, onChange, placeholderKey = "Field", placeholderValue = "Valor" }) => {
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const newId  = useIdGen();
  const add    = () => onChange([...items, { id: newId(), key: "", value: "" }]);
  const remove = (id: string) => onChange(items.filter(i => i.id !== id));
  const edit   = (id: string, patch: Partial<KV>) => onChange(items.map(i => i.id === id ? { ...i, ...patch } : i));

  return (
    <Stack spacing={3}>
      {items.map(row => (
        <HStack key={row.id} align="stretch">
          <Input value={row.key} placeholder={placeholderKey} onChange={e => edit(row.id, { key: e.target.value })} />
          <Input value={row.value} placeholder={placeholderValue} onChange={e => edit(row.id, { value: e.target.value })} />
          <IconButton aria-label="Eliminar" icon={<CloseIcon boxSize="2" />} variant="ghost" borderWidth="1px" borderColor={border} onClick={() => remove(row.id)} />
        </HStack>
      ))}
      <Button size="sm" onClick={add} alignSelf="flex-start">+ New field</Button>
    </Stack>
  );
};

/* --------------------------------- Create UI -------------------------------- */
type AssetType = "License" | "Skin" | "Asset" | "Custom";
type ImageMode = "ipfs" | "url";

// TODO: sustituir por URLs reales de documentación
const INMUTABLE_DOC_URL = "https://nice1.link/docs/datos-inmutables";
const MUTABLE_DOC_URL   = "https://nice1.link/docs/datos-mutables";

const CreatorPage: React.FC = () => {
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const bg     = useColorModeValue("white", "gray.800");

  const [assetType, setAssetType]   = useState<AssetType>("License");
  const [customTypeRaw, setCustomTypeRaw] = useState("");
  const customType = useMemo(() => assetType === "Custom" ? toCapitalizedWord(customTypeRaw) : "", [assetType, customTypeRaw]);

  // Nombre: siempre 1ª en mayúscula, resto en minúscula
  const [nameRaw, setNameRaw] = useState("");
  const name = useMemo(() => toPrimeraMayus(nameRaw), [nameRaw]);

  const [imageMode, setImageMode] = useState<ImageMode>("ipfs");
  const [imageValue, setImageValue] = useState("");
  const imageNormalized = useMemo(() => {
    if (imageMode === "ipfs") {
      if (!imageValue) return "";
      return imageValue.startsWith("ipfs://") ? imageValue : `ipfs://${imageValue}`;
    }
    return imageValue;
  }, [imageMode, imageValue]);

  const [idataExtras, setIdataExtras] = useState<KV[]>([]);
  const [mdataExtras, setMdataExtras] = useState<KV[]>([]);

  return (
    <Box flex="1" p={{ base: 0, md: 2 }}>
      <Box bg={bg} borderWidth="1px" borderColor={border} rounded="lg" p={6}>
        <Heading size="md" mb={4}>Create</Heading>

        <Stack spacing={6} maxW="820px">
          {/* Tipo de activo */}
          <Box>
            <Text fontWeight="semibold" mb={2}>Seleccione 1 "Activo" a crear:</Text>
            <RadioGroup value={assetType} onChange={v => setAssetType(v as AssetType)}>
              <HStack spacing={6}>
                <Radio value="License">License</Radio>
                <Radio value="Skin">Skin</Radio>
                <Radio value="Asset">Asset</Radio>
                <Radio value="Custom">Custom</Radio>
              </HStack>
            </RadioGroup>

            {assetType === "Custom" && (
              <Box mt={3}>
                <Input placeholder='Defina tipo Custom (1 palabra, ej. "Tag")'
                  value={customTypeRaw} onChange={e => setCustomTypeRaw(e.target.value)} />
                <Text fontSize="xs" opacity={0.7} mt={1}>
                  Se aplicará automáticamente: <b>{customType || "—"}</b>
                </Text>
              </Box>
            )}
          </Box>

          {/* Nombre */}
          <Box>
            <Text fontWeight="semibold" mb={2}>Nombre</Text>
            <Input
              placeholder="Ingrese el nombre del Juego, Skin o Asset que quiere crear"
              value={nameRaw} onChange={e => setNameRaw(e.target.value)}
            />
            <Text fontSize="sm" mt={2}>
              Formato aplicado automáticamente: <b>{name || "—"}</b>
            </Text>
          </Box>

          {/* Imagen */}
          <Box>
            <Text fontWeight="semibold" mb={2}>Imagen representativa del "Activo"</Text>
            <RadioGroup value={imageMode} onChange={v => setImageMode(v as ImageMode)}>
              <HStack spacing={6} mb={2}>
                <Radio value="ipfs">IPFS (CID o ipfs://CID)</Radio>
                <Radio value="url">URL</Radio>
              </HStack>
            </RadioGroup>
            <Input
              placeholder={imageMode === "ipfs" ? "CID o ipfs://<cid>" : "https://example.com/imagen.png"}
              value={imageValue} onChange={e => setImageValue(e.target.value)}
            />
            <Text fontSize="xs" opacity={0.7} mt={1}>
              Guardaremos en <code>mdata.img</code>: <b>{imageNormalized || "—"}</b>
            </Text>
          </Box>

          {/* Extras inmutables */}
          <Box>
            <Text fontWeight="semibold">¿Necesita añadir un valor extra inmutable?</Text>
            <Text fontSize="sm" mb={2}><em>* </em>
              <Link href={INMUTABLE_DOC_URL} isExternal color="teal.500">
                Leer más sobre datos extras inmutables
              </Link>
            </Text>
            <KeyValueList items={idataExtras} onChange={setIdataExtras}
              placeholderKey="Field (ej. rarity)" placeholderValue="Valor (ej. legendary)" />
          </Box>

          {/* Extras mutables */}
          <Box>
            <Text fontWeight="semibold">¿Necesita añadir un valor extra mutable?</Text>
            <Text fontSize="sm" mb={2}><em>* </em>
              <Link href={MUTABLE_DOC_URL} isExternal color="teal.500">
                Leer más sobre datos extras mutables
              </Link>
            </Text>
            <KeyValueList items={mdataExtras} onChange={setMdataExtras}
              placeholderKey="Field (ej. color)" placeholderValue="Valor (ej. rojo)" />
          </Box>

          {/* Botonera */}
          <HStack spacing={3} flexWrap="wrap">
            <Button colorScheme="teal">
              Create {assetType === "Custom" && customType ? customType : assetType}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAssetType("License");
                setCustomTypeRaw("");
                setNameRaw("");
                setImageMode("ipfs");
                setImageValue("");
                setIdataExtras([]);
                setMdataExtras([]);
              }}
            >
              Limpiar
            </Button>
          </HStack>

          <Text fontSize="xs" opacity={0.7}>
            * Próximo paso: conectar wallet/contrato. Usaremos
            <code> idata.name = "{name}" </code> y
            <code> mdata.img = "{imageNormalized}"</code>
            {assetType === "Custom" && customType ? `, tipo Custom = "${customType}".` : "."}
          </Text>
        </Stack>
      </Box>
    </Box>
  );
};

export default CreatorPage;

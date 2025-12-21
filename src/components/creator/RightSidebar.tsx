// src/components/creator/RightSidebar.tsx
import React, { useState } from "react";
import {
  Box,
  Stack,
  Text,
  Divider,
  Spinner,
  Center,
  Badge,
  useColorModeValue,
  useDisclosure,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Image,
} from "@chakra-ui/react";
import { EditIcon, CopyIcon, DeleteIcon, CloseIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useStockContext, GroupedAsset } from "../../contexts/StockContext";
import DuplicateModal from "./DuplicateModal";
import { useBurn } from "../../hooks/useBurn";
import { useToast } from "@chakra-ui/react";

/* ---------- Título de sección ---------- */
const PanelTitle: React.FC<{ children: React.ReactNode; count?: number }> = ({
  children,
  count,
}) => {
  const titleColor = useColorModeValue("gray.700", "whiteAlpha.900");
  return (
    <Text fontWeight="bold" fontSize="sm" color={titleColor} mb={2}>
      {children}
      {typeof count === "number" && count > 0 && (
        <Badge ml={2} colorScheme="teal" fontSize="xs">
          {count}
        </Badge>
      )}
    </Text>
  );
};

/* ---------- Tarjeta de item ---------- */
interface CardItemProps {
  title: string;
  subtitle?: string;
  copyCount: number;
  onClick?: () => void;
}

const CardItem: React.FC<CardItemProps> = ({
  title,
  subtitle,
  copyCount,
  onClick,
}) => {
  const bg = useColorModeValue("gray.50", "whiteAlpha.100");
  const hoverBg = useColorModeValue("gray.100", "whiteAlpha.200");

  return (
    <Tooltip label="Click para ver opciones" placement="left" hasArrow>
      <Box
        p={2}
        bg={bg}
        rounded="md"
        cursor="pointer"
        transition="background 0.15s"
        _hover={{ bg: hoverBg }}
        onClick={onClick}
      >
        <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text fontSize="xs" color="gray.500" noOfLines={1}>
            {subtitle}
          </Text>
        )}
        {copyCount > 1 && (
          <Badge colorScheme="purple" fontSize="xs" mt={1}>
            {copyCount} {copyCount === 1 ? "unit" : "units"}
          </Badge>
        )}
      </Box>
    </Tooltip>
  );
};

/* ---------- Modal de Acciones ---------- */
interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: GroupedAsset;
  onDuplicate: () => void;
  onModify: () => void;
  onBurn: () => void;
}

const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  asset,
  onDuplicate,
  onModify,
  onBurn,
}) => {
  const getImageUrl = () => {
    if (asset.mdata?.img) {
      const img = asset.mdata.img;
      if (img.startsWith("ipfs://")) {
        return `https://ipfs.io/ipfs/${img.replace("ipfs://", "")}`;
      }
      if (img.startsWith("Qm") || img.startsWith("bafy")) {
        return `https://ipfs.io/ipfs/${img}`;
      }
      return img;
    }
    // Fallback al campo image del asset
    if (asset.image) {
      if (asset.image.startsWith("ipfs://")) {
        return `https://ipfs.io/ipfs/${asset.image.replace("ipfs://", "")}`;
      }
      return asset.image;
    }
    return null;
  };

  const imageUrl = getImageUrl();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">{asset.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {/* Preview del asset */}
            <HStack spacing={3}>
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={asset.name}
                  boxSize="60px"
                  objectFit="cover"
                  rounded="md"
                  fallbackSrc="https://via.placeholder.com/60?text=?"
                />
              )}
              <VStack align="start" spacing={0} flex={1}>
                <Badge colorScheme="purple" fontSize="xs">
                  {asset.category}
                </Badge>
                <Text fontSize="xs" color="gray.500">
                  {asset.copyCount} {asset.copyCount === 1 ? "copia" : "copias"}
                </Text>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                  by {asset.author}
                </Text>
              </VStack>
            </HStack>

            <Divider />

            {/* Botones de acción */}
            <VStack spacing={2}>
              <Button
                size="sm"
                width="100%"
                leftIcon={<CopyIcon />}
                colorScheme="teal"
                onClick={() => {
                  onClose();
                  onDuplicate();
                }}
              >
                Duplicate
              </Button>
              <Button
                size="sm"
                width="100%"
                leftIcon={<EditIcon />}
                colorScheme="blue"
                variant="outline"
                onClick={() => {
                  onClose();
                  onModify();
                }}
              >
                Modify
              </Button>
              <Button
                size="sm"
                width="100%"
                leftIcon={<DeleteIcon />}
                colorScheme="red"
                variant="outline"
                onClick={() => {
                  onClose();
                  onBurn();
                }}
              >
                Delete
              </Button>
              <Button
                size="sm"
                width="100%"
                leftIcon={<CloseIcon boxSize={3} />}
                variant="ghost"
                onClick={onClose}
              >
                Close
              </Button>
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

/* ---------- RightSidebar ---------- */
const RightSidebar: React.FC = () => {
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const navigate = useNavigate();
  const toast = useToast();
  const { burnAsset } = useBurn();

  // Usar el contexto compartido
  const { groupedAssets, loading, filterByCategory, reload } = useStockContext();

  // Estado para el modal de acciones
  const {
    isOpen: isActionModalOpen,
    onOpen: onActionModalOpen,
    onClose: onActionModalClose,
  } = useDisclosure();

  // Estado para el modal de duplicar
  const {
    isOpen: isDuplicateModalOpen,
    onOpen: onDuplicateModalOpen,
    onClose: onDuplicateModalClose,
  } = useDisclosure();

  const [selectedAsset, setSelectedAsset] = useState<GroupedAsset | null>(null);

  // Filtrar por categoría
  const licenses = filterByCategory("license");
  const skins = filterByCategory("skin");
  const assets = filterByCategory("asset");
  const others = filterByCategory("custom");

  // Abrir modal de acciones con el asset seleccionado
  const handleAssetClick = (asset: GroupedAsset) => {
    setSelectedAsset(asset);
    onActionModalOpen();
  };

  // Handlers para cada acción
  const handleDuplicate = () => {
    if (selectedAsset) {
      onDuplicateModalOpen();
    }
  };

  const handleModify = () => {
    if (selectedAsset) {
      navigate(`/creator/modify?id=${selectedAsset.ids[0]}`);
    }
  };

  const handleBurn = async () => {
    if (!selectedAsset) return;

    if (window.confirm(`You definitely want to BURN "${selectedAsset.name}"?`)) {
      const result = await burnAsset([selectedAsset.ids[0]]);
      if (result.success) {
        toast({
          title: "Asset burned",
          description: `"${selectedAsset.name}" has been removed.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        await reload();
        setSelectedAsset(null);
        navigate('/creator/stock');
      } else {
        toast({
          title: "Error burning",
          description: result.error || "Unknown error",
          status: "error",
          duration: 7000,
          isClosable: true,
        });
      }
    }
  };

  // Callback cuando se duplica exitosamente
  const handleDuplicateSuccess = async () => {
    await reload();
    onDuplicateModalClose();
    setSelectedAsset(null);
  };

  if (loading) {
    return (
      <Box
        w={{ base: "100%", lg: "280px" }}
        minW={{ lg: "280px" }}
        flexShrink={0}
        p={4}
        borderLeftWidth={{ base: 0, lg: "1px" }}
        borderColor={border}
      >
        <Center minH="200px">
          <Spinner size="md" color="teal.500" />
        </Center>
      </Box>
    );
  }

  return (
    <>
      <Box
        w={{ base: "100%", lg: "320px" }}
        p={4}
        borderLeftWidth={{ base: 0, lg: "1px" }}
        borderColor={border}
      >
        <Stack spacing={6} maxH="calc(100vh - 8rem)" overflowY="auto">
          {/* Licenses */}
          <Box>
            <PanelTitle count={licenses.length}>Licenses</PanelTitle>
            {licenses.length === 0 ? (
              <Text fontSize="sm" color="gray.500" fontStyle="italic">
                Sin licenses
              </Text>
            ) : (
              <Stack spacing={2}>
                {licenses.slice(0, 5).map((asset) => (
                  <CardItem
                    key={asset.name + asset.category}
                    title={asset.name}
                    subtitle={asset.author !== asset.name ? asset.author : undefined}
                    copyCount={asset.copyCount}
                    onClick={() => handleAssetClick(asset)}
                  />
                ))}
                {licenses.length > 5 && (
                  <Text
                    fontSize="xs"
                    color="teal.500"
                    cursor="pointer"
                    onClick={() => handleAssetClick(licenses[5])}
                    _hover={{ textDecoration: "underline" }}
                  >
                    + {licenses.length - 5} más
                  </Text>
                )}
              </Stack>
            )}
          </Box>

          <Divider />

          {/* Skins */}
          <Box>
            <PanelTitle count={skins.length}>Skins</PanelTitle>
            {skins.length === 0 ? (
              <Text fontSize="sm" color="gray.500" fontStyle="italic">
                Sin skins
              </Text>
            ) : (
              <Stack spacing={2}>
                {skins.slice(0, 5).map((asset) => (
                  <CardItem
                    key={asset.name + asset.category}
                    title={asset.name}
                    subtitle={asset.author !== asset.name ? asset.author : undefined}
                    copyCount={asset.copyCount}
                    onClick={() => handleAssetClick(asset)}
                  />
                ))}
                {skins.length > 5 && (
                  <Text
                    fontSize="xs"
                    color="teal.500"
                    cursor="pointer"
                    onClick={() => handleAssetClick(skins[5])}
                    _hover={{ textDecoration: "underline" }}
                  >
                    + {skins.length - 5} más
                  </Text>
                )}
              </Stack>
            )}
          </Box>

          <Divider />

          {/* Assets */}
          <Box>
            <PanelTitle count={assets.length}>Assets</PanelTitle>
            {assets.length === 0 ? (
              <Text fontSize="sm" color="gray.500" fontStyle="italic">
                Sin assets
              </Text>
            ) : (
              <Stack spacing={2}>
                {assets.slice(0, 5).map((asset) => (
                  <CardItem
                    key={asset.name + asset.category}
                    title={asset.name}
                    subtitle={asset.author !== asset.name ? asset.author : undefined}
                    copyCount={asset.copyCount}
                    onClick={() => handleAssetClick(asset)}
                  />
                ))}
                {assets.length > 5 && (
                  <Text
                    fontSize="xs"
                    color="teal.500"
                    cursor="pointer"
                    onClick={() => handleAssetClick(assets[5])}
                    _hover={{ textDecoration: "underline" }}
                  >
                    + {assets.length - 5} más
                  </Text>
                )}
              </Stack>
            )}
          </Box>

          <Divider />

          {/* Others / Custom */}
          <Box>
            <PanelTitle count={others.length}>Others</PanelTitle>
            {others.length === 0 ? (
              <Text fontSize="sm" color="gray.500" fontStyle="italic">
                Sin otros
              </Text>
            ) : (
              <Stack spacing={2}>
                {others.slice(0, 5).map((asset) => (
                  <CardItem
                    key={asset.name + asset.category}
                    title={asset.name}
                    subtitle={asset.author !== asset.name ? asset.author : undefined}
                    copyCount={asset.copyCount}
                    onClick={() => handleAssetClick(asset)}
                  />
                ))}
                {others.length > 5 && (
                  <Text
                    fontSize="xs"
                    color="teal.500"
                    cursor="pointer"
                    onClick={() => handleAssetClick(others[5])}
                    _hover={{ textDecoration: "underline" }}
                  >
                    + {others.length - 5} más
                  </Text>
                )}
              </Stack>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Modal de acciones */}
      {selectedAsset && (
        <ActionModal
          isOpen={isActionModalOpen}
          onClose={() => {
            onActionModalClose();
            // No limpiamos selectedAsset aquí para mantenerlo disponible para duplicar
          }}
          asset={selectedAsset}
          onDuplicate={handleDuplicate}
          onModify={handleModify}
          onBurn={handleBurn}
        />
      )}

      {/* Modal de duplicar */}
      {selectedAsset && (
        <DuplicateModal
          isOpen={isDuplicateModalOpen}
          onClose={() => {
            onDuplicateModalClose();
            setSelectedAsset(null);
          }}
          asset={selectedAsset}
          onSuccess={handleDuplicateSuccess}
        />
      )}
    </>
  );
};

export default RightSidebar;
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
} from "@chakra-ui/react";
import { useStockContext, GroupedAsset } from "../../contexts/StockContext";
import DuplicateModal from "./DuplicateModal";

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
    <Tooltip label="Click para duplicar" placement="left" hasArrow>
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

const RightSidebar: React.FC = () => {
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  
  // Usar el contexto compartido en lugar de un hook local
  const { groupedAssets, loading, filterByCategory, reload } = useStockContext();

  // Estado para el modal de duplicar
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAsset, setSelectedAsset] = useState<GroupedAsset | null>(null);

  // Filtrar por categoría
  const licenses = filterByCategory("license");
  const skins = filterByCategory("skin");
  const assets = filterByCategory("asset");
  const others = filterByCategory("custom");

  // Abrir modal de duplicar con el asset seleccionado
  const handleAssetClick = (asset: GroupedAsset) => {
    setSelectedAsset(asset);
    onOpen();
  };

  // Callback cuando se duplica exitosamente
  const handleDuplicateSuccess = async () => {
    await reload(); // Recargar el stock compartido
    onClose();
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

      {/* Modal de duplicar */}
      {selectedAsset && (
        <DuplicateModal
          isOpen={isOpen}
          onClose={() => {
            onClose();
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
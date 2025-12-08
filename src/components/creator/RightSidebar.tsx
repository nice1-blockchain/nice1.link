// src/components/creator/RightSidebar.tsx
import React from "react";
import {
  Box,
  Stack,
  Heading,
  Text,
  Divider,
  Spinner,
  Center,
  useColorModeValue,
  Badge,
  Tooltip,
} from "@chakra-ui/react";
import { useStock } from "../../hooks/useStock";
import { useNavigate } from "react-router-dom";

const PanelTitle: React.FC<React.PropsWithChildren<{ count?: number }>> = ({
  children,
  count,
}) => (
  <Heading as="h3" size="sm" mb={2}>
    {children}
    {count !== undefined && count > 0 && (
      <Badge ml={2} colorScheme="teal" fontSize="xs">
        {count}
      </Badge>
    )}
  </Heading>
);

interface CardItemProps {
  title: string;
  subtitle?: string;
  copyCount?: number;
  onClick?: () => void;
}

const CardItem: React.FC<CardItemProps> = ({
  title,
  subtitle,
  copyCount,
  onClick,
}) => {
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const hover = useColorModeValue("gray.50", "whiteAlpha.100");

  return (
    <Tooltip
      label={copyCount && copyCount > 1 ? `${copyCount} copias` : title}
      placement="left"
    >
      <Box
        p={3}
        borderWidth="1px"
        borderColor={border}
        rounded="md"
        _hover={{ bg: hover }}
        cursor="pointer"
        onClick={onClick}
      >
        <Text fontWeight="semibold" noOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text fontSize="xs" opacity={0.7} noOfLines={1}>
            {subtitle}
          </Text>
        )}
        {copyCount && copyCount > 1 && (
          <Badge colorScheme="teal" fontSize="xs" mt={1}>
            {copyCount} {copyCount === 1 ? "copia" : "copias"}
          </Badge>
        )}
      </Box>
    </Tooltip>
  );
};

const RightSidebar: React.FC = () => {
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const navigate = useNavigate();
  const { groupedAssets, loading, filterByCategory } = useStock();

  // Filtrar por categoría
  const licenses = filterByCategory("license");
  const skins = filterByCategory("skin");
  const assets = filterByCategory("asset");
  const others = filterByCategory("custom");

  // Navegar a stock al hacer click
  const handleAssetClick = () => {
    navigate("/creator/stock");
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
                  onClick={handleAssetClick}
                />
              ))}
              {licenses.length > 5 && (
                <Text
                  fontSize="xs"
                  color="teal.500"
                  cursor="pointer"
                  onClick={handleAssetClick}
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
                  onClick={handleAssetClick}
                />
              ))}
              {skins.length > 5 && (
                <Text
                  fontSize="xs"
                  color="teal.500"
                  cursor="pointer"
                  onClick={handleAssetClick}
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
                  onClick={handleAssetClick}
                />
              ))}
              {assets.length > 5 && (
                <Text
                  fontSize="xs"
                  color="teal.500"
                  cursor="pointer"
                  onClick={handleAssetClick}
                  _hover={{ textDecoration: "underline" }}
                >
                  + {assets.length - 5} más
                </Text>
              )}
            </Stack>
          )}
        </Box>

        <Divider />

        {/* Others (Custom) */}
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
                  onClick={handleAssetClick}
                />
              ))}
              {others.length > 5 && (
                <Text
                  fontSize="xs"
                  color="teal.500"
                  cursor="pointer"
                  onClick={handleAssetClick}
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
  );
};

export default RightSidebar;
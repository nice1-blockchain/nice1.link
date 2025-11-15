// src/components/creator/AssetCard.tsx
import React from 'react';
import {
  Box,
  Image,
  Text,
  Badge,
  VStack,
  HStack,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { GroupedAsset } from '../../hooks/useStock';

interface AssetCardProps {
  asset: GroupedAsset;
  onClick: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick }) => {
  const border = useColorModeValue('gray.200', 'whiteAlpha.300');
  const bg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  // Determinar color del badge según categoría
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      License: 'blue',
      Skin: 'purple',
      Asset: 'green',
      Custom: 'orange',
    };
    return colors[category] || 'gray';
  };

  // Convertir IPFS a URL HTTP
  const getImageUrl = (img: string): string => {
    if (!img) return '/placeholder-image.png'; // Placeholder si no hay imagen
    
    if (img.startsWith('ipfs://')) {
      const cid = img.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${cid}`;
    }
    
    return img;
  };

  return (
    <Box
      borderWidth="1px"
      borderColor={border}
      rounded="lg"
      overflow="hidden"
      bg={bg}
      transition="all 0.2s"
      cursor="pointer"
      onClick={onClick}
      _hover={{
        bg: hoverBg,
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
      }}
    >
      {/* Imagen del Asset */}
      <Box position="relative" h="200px" bg="gray.100">
        <Image
          src={getImageUrl(asset.image)}
          alt={asset.name}
          objectFit="cover"
          w="100%"
          h="100%"
          fallbackSrc="https://via.placeholder.com/400x300?text=No+Image"
        />
        
        {/* Badge de categoría */}
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme={getCategoryColor(asset.category)}
          fontSize="xs"
        >
          {asset.category}
        </Badge>

        {/* Badge de copias */}
        {asset.copyCount > 1 && (
          <Tooltip label={`${asset.copyCount} copias en total`} placement="top">
            <Badge
              position="absolute"
              bottom={2}
              right={2}
              colorScheme="teal"
              fontSize="sm"
              px={2}
              py={1}
            >
              {asset.copyCount} {asset.copyCount === 1 ? 'copia' : 'copias'}
            </Badge>
          </Tooltip>
        )}
      </Box>

      {/* Información del Asset */}
      <VStack align="stretch" p={4} spacing={2}>
        <Tooltip label={asset.name} placement="top">
          <Text
            fontWeight="bold"
            fontSize="md"
            noOfLines={1}
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {asset.name}
          </Text>
        </Tooltip>

        <HStack justify="space-between" fontSize="xs" color="gray.500">
          <Text>IDs: {asset.ids.length}</Text>
          <Text noOfLines={1}>by {asset.author}</Text>
        </HStack>

        {/* Campos extras (opcional) */}
        {Object.keys(asset.idata).length > 1 && (
          <Text fontSize="xs" color="gray.500">
            + {Object.keys(asset.idata).length - 1} campo
            {Object.keys(asset.idata).length - 1 !== 1 ? 's' : ''} extra
            {Object.keys(asset.idata).length - 1 !== 1 ? 's' : ''}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default AssetCard;
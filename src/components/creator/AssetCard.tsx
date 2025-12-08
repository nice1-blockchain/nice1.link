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
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { EditIcon, CopyIcon, DeleteIcon } from '@chakra-ui/icons';
import { FiMoreVertical } from 'react-icons/fi';
import { GroupedAsset } from '../../hooks/useStock';

interface AssetCardProps {
  asset: GroupedAsset;
  onClick: () => void;
  onModify?: (asset: GroupedAsset) => void;
  onDuplicate?: (asset: GroupedAsset) => void;
  onBurn?: (asset: GroupedAsset) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ 
  asset, 
  onClick, 
  onModify, 
  onDuplicate, 
  onBurn 
}) => {
  const border = useColorModeValue('gray.200', 'whiteAlpha.300');
  const bg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      license: 'blue',
      skin: 'purple',
      asset: 'green',
      custom: 'orange',
    };
    return colors[category.toLowerCase()] || 'gray';
  };

  const getImageUrl = (img: string): string => {
    if (!img) return '/placeholder-image.png';
    if (img.startsWith('ipfs://')) {
      const cid = img.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${cid}`;
    }
    return img;
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
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
      _hover={{ bg: hoverBg, transform: 'translateY(-2px)', boxShadow: 'lg' }}
    >
      {/* Imagen */}
      <Box position="relative" h="200px" bg="gray.100">
        <Image
          src={getImageUrl(asset.image)}
          alt={asset.name}
          objectFit="cover"
          w="100%"
          h="100%"
          fallbackSrc="https://via.placeholder.com/400x300?text=No+Image"
        />
        
        {/* Badge categoría */}
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme={getCategoryColor(asset.category)}
          fontSize="xs"
        >
          {asset.category}
        </Badge>

        {/* Badge copias */}
        {asset.copyCount > 1 && (
          <Tooltip label={`${asset.copyCount} copias en total`}>
            <Badge position="absolute" bottom={2} right={2} colorScheme="teal" px={2} py={1}>
              {asset.copyCount} copias
            </Badge>
          </Tooltip>
        )}
      </Box>

      {/* Info + Acciones */}
      <VStack align="stretch" p={4} spacing={2}>
        <HStack justify="space-between">
          <Tooltip label={asset.name}>
            <Text fontWeight="bold" fontSize="md" noOfLines={1} flex="1">
              {asset.name}
            </Text>
          </Tooltip>

          {/* Menú de acciones */}
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FiMoreVertical />}
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
              aria-label="Acciones"
            />
            <MenuList onClick={(e) => e.stopPropagation()}>
              <MenuItem icon={<EditIcon />} onClick={(e) => handleAction(e, () => onModify?.(asset))}>
                Modificar
              </MenuItem>
              <MenuItem icon={<CopyIcon />} onClick={(e) => handleAction(e, () => onDuplicate?.(asset))}>
                Duplicar
              </MenuItem>
              <MenuItem icon={<DeleteIcon />} color="red.400" onClick={(e) => handleAction(e, () => onBurn?.(asset))}>
                Borrar (Burn)
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>

        <HStack justify="space-between" fontSize="xs" color="gray.500">
          <Text>IDs: {asset.ids.length}</Text>
          <Text noOfLines={1}>by {asset.author}</Text>
        </HStack>
      </VStack>
    </Box>
  );
};

export default AssetCard;
// src/components/creator/AssetCard.tsx
import React, { useState } from 'react';
import {
  Box,
  Image,
  Text,
  Badge,
  VStack,
  HStack,
  useColorModeValue,
  Tooltip,
  Button,
  Collapse,
} from '@chakra-ui/react';
import { EditIcon, CopyIcon, DeleteIcon, CloseIcon, SettingsIcon } from '@chakra-ui/icons';
import { FaShoppingCart } from 'react-icons/fa';
import { GroupedAsset } from '../../hooks/useStock';

interface AssetCardProps {
  asset: GroupedAsset;
  onClick?: () => void; // Ya no se usa directamente
  onModify?: (asset: GroupedAsset) => void;
  onDuplicate?: (asset: GroupedAsset) => void;
  onBurn?: (asset: GroupedAsset) => void;
  onSale?: (asset: GroupedAsset) => void;
  onManage?: (asset: GroupedAsset) => void;
  isOnSale?: boolean;
}

const AssetCard: React.FC<AssetCardProps> = ({ 
  asset, 
  onModify, 
  onDuplicate, 
  onBurn,
  onSale,
  onManage,
  isOnSale = false, 
}) => {
  const border = useColorModeValue('gray.200', 'whiteAlpha.300');
  const bg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const menuBg = useColorModeValue('gray.100', 'gray.600');

  // Estado para mostrar/ocultar el menú de acciones
  const [showActions, setShowActions] = useState(false);

  const canSell = asset.copyCount > 1 && !isOnSale;

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

  const handleCardClick = () => {
    setShowActions(!showActions);
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    setShowActions(false);
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
      onClick={handleCardClick}
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

        {/* Badge "En Venta" si ya está en venta */}
        {isOnSale && (
          <Badge
            position="absolute"
            top={2}
            left={2}
            colorScheme="green"
            fontSize="xs"
          >
            En Venta
          </Badge>
        )}

        {/* Badge copias */}
        {asset.copyCount > 1 && (
          <Tooltip label={`${asset.copyCount} units`}>
            <Badge position="absolute" bottom={2} right={2} colorScheme="teal" px={2} py={1}>
              {asset.copyCount} units
            </Badge>
          </Tooltip>
        )}
      </Box>

      {/* Info */}
      <VStack align="stretch" p={4} spacing={2}>
        <HStack justify="space-between">
          <Tooltip label={asset.name}>
            <Text fontWeight="bold" fontSize="md" noOfLines={1} flex="1">
              {asset.name}
            </Text>
          </Tooltip>
        </HStack>

        <HStack justify="space-between" fontSize="xs" color="gray.500">
          <Text>Units: {asset.ids.length}</Text>
          <Text noOfLines={1}>by {asset.author}</Text>
        </HStack>

        {/* Menú de acciones colapsable */}
        <Collapse in={showActions} animateOpacity>
          <VStack 
            spacing={2} 
            pt={3} 
            mt={2} 
            borderTopWidth="1px" 
            borderColor={border}
          >
            <Button
              size="sm"
              width="100%"
              leftIcon={<CopyIcon />}
              colorScheme="teal"
              variant="solid"
              onClick={(e) => handleAction(e, () => onDuplicate?.(asset))}
            >
              Duplicate
            </Button>
            <Button
              size="sm"
              width="100%"
              leftIcon={<EditIcon />}
              colorScheme="blue"
              variant="outline"
              onClick={(e) => handleAction(e, () => onModify?.(asset))}
            >
              Modify
            </Button>
            {/* Botón de Venta o Gestionar según estado */}
            {isOnSale ? (
              // Ya está en venta: mostrar botón "Gestionar"
              <Button
                size="sm"
                width="100%"
                leftIcon={<SettingsIcon />}
                colorScheme="orange"
                variant="solid"
                onClick={(e) => handleAction(e, () => onManage?.(asset))}
              >
                Gestionar Venta
              </Button>
            ) : (
              // No está en venta: mostrar botón "Venta"
              <Tooltip
                label={canSell ? 'Poner en venta' : 'Necesitas más de 1 copia para vender'}
                hasArrow
              >
                <Button
                  size="sm"
                  width="100%"
                  leftIcon={<FaShoppingCart />}
                  colorScheme="green"
                  variant={canSell ? 'solid' : 'outline'}
                  onClick={(e) => handleAction(e, () => onSale?.(asset))}
                  isDisabled={!canSell}
                  opacity={canSell ? 1 : 0.5}
                >
                  Venta {!canSell && '(1+ copias)'}
                </Button>
              </Tooltip>
            )}
            <Button
              size="sm"
              width="100%"
              leftIcon={<DeleteIcon />}
              colorScheme="red"
              variant="outline"
              onClick={(e) => handleAction(e, () => onBurn?.(asset))}
            >
              Delete
            </Button>
            <Button
              size="sm"
              width="100%"
              leftIcon={<CloseIcon boxSize={3} />}
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(false);
              }}
            >
              Close
            </Button>
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  );
};

export default AssetCard;
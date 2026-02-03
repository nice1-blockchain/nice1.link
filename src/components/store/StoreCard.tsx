// src/components/store/StoreCard.tsx
import React from 'react';
import { Box, Image, Text, Button, VStack, HStack, useToast, Badge } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAnchor } from '@nice1/react-tools';
import { StoreItem } from '../../hooks/useStore';

interface Props {
  item: StoreItem;
}

const StoreCard: React.FC<Props> = ({ item }) => {
  const { session } = useAnchor();
  const toast = useToast();
  const nav = useNavigate();

  // Función para normalizar URLs de imagen (IPFS o HTTP)
  const getImageUrl = (img: string): string => {
    if (!img) return 'https://via.placeholder.com/300x160?text=Nice1+Game';
    if (img.startsWith('ipfs://')) {
      const cid = img.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${cid}`;
    }
    return img;
  };

  const handleBuy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita navegar a la página de detalle al hacer clic en comprar
    
    if (!session) {
      return toast({ 
        title: "Wallet no conectado", 
        description: "Por favor, conecta tu wallet para comprar.", 
        status: "warning" 
      });
    }

    try {
      // Acción de transferencia según requerimientos
      const action = {
        account: item.tokencontract, // Contrato del token de la tabla
        name: 'transfer',
        authorization: [{
            actor: session.auth.actor,
            permission: session.auth.permission,
        }],
        data: {
          from: session.auth.actor,     // Usuario logueado
          to: 'n1licensepos',           // Destino fijo
          quantity: item.price,         // Precio de la tabla
          memo: item.ext_ref            // Referencia externa
        },
      };

      await session.transact({ action });
      
      toast({ 
        title: "¡Compra exitosa!", 
        description: `Has adquirido ${item.product}`, 
        status: "success",
        duration: 5000 
      });

    } catch (err: any) {
      console.error("Error en la compra:", err);
      toast({ 
        title: "Error en la transacción", 
        description: err.message || "No se pudo completar la compra", 
        status: "error" 
      });
    }
  };

  return (
    <Box 
      bg="gray.800" 
      rounded="lg" 
      overflow="hidden" 
      cursor="pointer"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-4px)', borderColor: 'blue.400', shadow: 'dark-lg' }}
      onClick={() => nav(`/store/${encodeURIComponent(item.product)}`)}
    >
      <Image 
        src={getImageUrl(item.displayImage)} 
        h="180px" 
        w="100%" 
        objectFit="cover"
        fallbackSrc="https://via.placeholder.com/300x180?text=Cargando..."
      />
      
      <VStack p={4} align="start" spacing={3}>
        <VStack align="start" spacing={0} w="100%">
          <Text fontWeight="bold" fontSize="md" color="white" noOfLines={1}>
            {item.product}
          </Text>
          <Text fontSize="xs" color="gray.500" textTransform="uppercase">
            ID: {item.int_ref.toString()}
          </Text>
        </VStack>

        <Text fontSize="sm" color="gray.300" noOfLines={2} h="40px">
          {item.metadata.shortDescription}
        </Text>

        <HStack w="100%" justify="space-between" pt={2}>
          <Badge colorScheme="blue" fontSize="sm" px={2} py={1} rounded="md" variant="subtle">
            {item.price}
          </Badge>
          <Button 
            size="sm" 
            colorScheme="blue" 
            variant="solid"
            onClick={handleBuy}
            _hover={{ bg: 'blue.600' }}
          >
            Comprar
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default StoreCard;
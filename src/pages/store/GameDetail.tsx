import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Stack,
  Text,
  Image,
  Flex,
  VStack,
  Button,
  Heading,
  SimpleGrid,
  StackDivider,
  useColorModeValue,
  List,
  ListItem,
  Badge,
  AspectRatio,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { useAnchor } from '@nice1/react-tools';
import DashboardLayout from '../../dashboard/DashboardLayout';
import ReactMarkdown from 'react-markdown'; // Necesitarás instalar: npm install react-markdown

const GameDetail = () => {
  const { productName } = useParams<{ productName: string }>();
  const { storeItems, loading } = useStore();
  const { session } = useAnchor();
  const toast = useToast();

  // Buscar el producto específico
  const item = useMemo(() => 
    storeItems.find((i) => i.product === decodeURIComponent(productName || '')),
    [storeItems, productName]
  );

  // Estado para la imagen/vídeo principal del slider
  const [mainMedia, setMainMedia] = useState<string | null>(null);

  const getImageUrl = (img: string) => {
    if (!img) return 'https://via.placeholder.com/600x400?text=No+Image';
    return img.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${img.replace('ipfs://', '')}` : img;
  };

  const handleBuy = async () => {
    if (!session || !item) return toast({ title: "Conecta tu wallet", status: "warning" });

    try {
      const action = {
        account: item.tokencontract, //
        name: 'transfer',
        authorization: [{ actor: session.auth.actor, permission: session.auth.permission }],
        data: {
          from: session.auth.actor, //
          to: 'n1licensepos',       //
          quantity: item.price,     //
          memo: item.ext_ref        //
        },
      };
      await session.transact({ action });
      toast({ title: "¡Compra exitosa!", status: "success" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, status: "error" });
    }
  };

  if (loading) return <DashboardLayout><Box p={10}>Cargando...</Box></DashboardLayout>;
  if (!item) return <DashboardLayout><Box p={10}>Producto no encontrado</Box></DashboardLayout>;

  const activeMedia = mainMedia || item.metadata.videoUrl || getImageUrl(item.displayImage);

  return (
    <DashboardLayout>
      <Container maxW={'7xl'} py={6}>
        {/* Navegación básica */}
        <Breadcrumb mb={4} fontSize="sm" color="gray.500">
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/store">Store</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{item.product}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, md: 10 }}>
          {/* COLUMNA IZQUIERDA: Slider y Media */}
          <VStack spacing={4}>
            <Box w="100%" borderRadius="lg" overflow="hidden" bg="black">
              {activeMedia.includes('youtube.com') || activeMedia.includes('youtu.be') ? (
                <AspectRatio ratio={16 / 9}>
                  <iframe src={activeMedia.replace('watch?v=', 'embed/')} title="video" allowFullScreen />
                </AspectRatio>
              ) : (
                <Image src={activeMedia} alt="Game media" objectFit="cover" w="100%" />
              )}
            </Box>
            
            {/* 4 imágenes preview para el slider */}
            <SimpleGrid columns={4} spacing={2} w="100%">
              {item.metadata.previews.map((url, index) => (
                <Box 
                  key={index} 
                  cursor="pointer" 
                  opacity={activeMedia === url ? 1 : 0.6}
                  onClick={() => setMainMedia(url)}
                  border="2px solid"
                  borderColor={activeMedia === url ? "blue.400" : "transparent"}
                >
                  <Image src={getImageUrl(url)} h="60px" w="100%" objectFit="cover" />
                </Box>
              ))}
            </SimpleGrid>
          </VStack>

          {/* COLUMNA DERECHA: Info y Compra */}
          <Stack spacing={{ base: 4, md: 6 }}>
            <Box as={'header'}>
              <Heading fontWeight={600} fontSize={{ base: '2xl', md: '4xl' }}>
                {item.product}
              </Heading>
              <Badge colorScheme="blue" mt={2}>{item.price}</Badge>
            </Box>

            <Stack spacing={4} divider={<StackDivider borderColor="gray.600" />}>
              <VStack align="start">
                <Text color="gray.400" fontSize={'lg'}>
                  {item.metadata.shortDescription}
                </Text>
              </VStack>

              {/* Botón de compra principal */}
              <Button
                rounded={'md'}
                w={'full'}
                size={'lg'}
                py={'7'}
                bg="blue.500"
                color="white"
                textTransform={'uppercase'}
                _hover={{ bg: 'blue.600' }}
                onClick={handleBuy}
              >
                Comprar ahora
              </Button>

              <Box>
                <Text fontSize="sm" fontWeight="bold" color="blue.400" mb={2}>
                  DETALLES TÉCNICOS
                </Text>
                <List spacing={2} fontSize="xs" color="gray.500">
                  <ListItem>Contrato: {item.tokencontract}</ListItem>
                  <ListItem>Referencia: {item.ext_ref}</ListItem>
                  <ListItem>Vendedor: n1licensepos</ListItem>
                </List>
              </Box>
            </Stack>
          </Stack>
        </SimpleGrid>

        {/* SECCIÓN INFERIOR: Descripción larga con Markdown */}
        <Box mt={10} p={6} bg="gray.800" borderRadius="md">
          <Heading size="md" mb={4} borderBottom="1px solid" borderColor="gray.700" pb={2}>
            Acerca de este juego
          </Heading>
          <Box color="gray.300" className="markdown-body">
             {/* Renderizado de descripción larga */}
            <ReactMarkdown>{item.metadata.longDescription}</ReactMarkdown>
          </Box>
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default GameDetail;
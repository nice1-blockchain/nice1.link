import React from "react";
import { Box, Stack, Heading, Text, Divider, useColorModeValue } from "@chakra-ui/react";

type Item = { id: string; title: string; subtitle?: string };

const mock: Record<"licenses" | "skins" | "assets" | "others", Item[]> = {
  licenses: [{ id: "lic-001", title: "License A", subtitle: "v1.0" }, { id: "lic-002", title: "License B", subtitle: "v2.3" }],
  skins: [{ id: "sk-101", title: "Skin Red" }, { id: "sk-102", title: "Skin Blue" }],
  assets: [{ id: "as-201", title: "Model Chair" }, { id: "as-202", title: "Texture Wood" }],
  others: [{ id: "ot-301", title: "Custom Tag" }],
};

const PanelTitle: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Heading as="h3" size="sm" mb={2}>{children}</Heading>
);

const CardItem: React.FC<Item> = ({ title, subtitle }) => {
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const hover  = useColorModeValue("gray.50",  "whiteAlpha.100");
  return (
    <Box p={3} borderWidth="1px" borderColor={border} rounded="md" _hover={{ bg: hover }} cursor="pointer">
      <Text fontWeight="semibold" noOfLines={1}>{title}</Text>
      {subtitle && <Text fontSize="xs" opacity={0.7} noOfLines={1}>{subtitle}</Text>}
    </Box>
  );
};

const RightSidebar: React.FC = () => {
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  return (
    <Box w={{ base: "100%", lg: "320px" }} p={4} borderLeftWidth={{ base: 0, lg: "1px" }} borderColor={border}>
      <Stack spacing={6} maxH="calc(100vh - 8rem)" overflowY="auto">
        <Box><PanelTitle>Licenses</PanelTitle><Stack spacing={2}>{mock.licenses.map(i => <CardItem key={i.id} {...i} />)}</Stack></Box>
        <Divider />
        <Box><PanelTitle>Skins</PanelTitle><Stack spacing={2}>{mock.skins.map(i => <CardItem key={i.id} {...i} />)}</Stack></Box>
        <Divider />
        <Box><PanelTitle>Assets</PanelTitle><Stack spacing={2}>{mock.assets.map(i => <CardItem key={i.id} {...i} />)}</Stack></Box>
        <Divider />
        <Box><PanelTitle>Others</PanelTitle><Stack spacing={2}>{mock.others.map(i => <CardItem key={i.id} {...i} />)}</Stack></Box>
      </Stack>
    </Box>
  );
};

export default RightSidebar;

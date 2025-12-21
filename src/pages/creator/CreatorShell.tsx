// src/pages/creator/CreatorShell.tsx
import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import DashboardLayout from "../../dashboard/DashboardLayout";
import RightSidebar from "../../components/creator/RightSidebar";
import { StockProvider } from "../../contexts/StockContext";

const CreatorShell: React.FC = () => {
  return (
    <DashboardLayout>
      {/* StockProvider envuelve todo para compartir estado entre páginas y sidebar */}
      <StockProvider>
        <Flex
          as="section"
          w="100%"
          h="100%"
          gap={0}
          align="stretch"
          direction={{ base: "column", lg: "row" }}
        >
          {/* Contenido principal - ocupa el espacio disponible */}
          <Box flex="1" minW={0} overflow="auto">
            <Outlet />
          </Box>
          
          {/* Sidebar derecho - ancho fijo, siempre visible */}
          <RightSidebar />
        </Flex>
      </StockProvider>
    </DashboardLayout>
  );
};

export default CreatorShell;
// src/pages/creator/CreatorShell.tsx
import React from "react";
import { Flex, useBreakpointValue, Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import DashboardLayout from "../../dashboard/DashboardLayout";
import RightSidebar from "../../components/creator/RightSidebar";

const CreatorShell: React.FC = () => {
  // Evita unions complejos: resuelve la dirección por breakpoint
  const dir = useBreakpointValue<"column" | "row">({ base: "column", lg: "row" });

  const flexDirection: "column" | "row" = dir !== undefined ? dir : "column";

  return (
    <DashboardLayout>
      <Flex
        as="section"
        w="100%"
        gap={0}
        align="stretch"
        direction={flexDirection}
      >
        {/* Contenido principal - ocupa el espacio disponible */}
        <Box flex="1" minW={0}>
          <Outlet />
        </Box>
        
        {/* Sidebar derecho - ancho fijo, siempre visible */}
        <RightSidebar />
      </Flex>
    </DashboardLayout>
  );
};

export default CreatorShell;

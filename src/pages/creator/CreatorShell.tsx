// src/pages/creator/CreatorShell.tsx
import React from "react";
import { Flex, useBreakpointValue } from "@chakra-ui/react";
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
        {/* Aquí se pintan las subrutas (Main / Create) */}
        <Outlet />
        {/* Sidebar derecho común */}
        <RightSidebar />
      </Flex>
    </DashboardLayout>
  );
};

export default CreatorShell;

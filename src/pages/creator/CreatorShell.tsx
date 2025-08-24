import React from "react";
import { Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import DashboardLayout from "../../dashboard/DashboardLayout";
import RightSidebar from "../../components/creator/RightSidebar";

const CreatorShell: React.FC = () => {
  return (
    <DashboardLayout>
      <Flex as="section" w="100%" gap={0} align="stretch" direction={{ base: "column", lg: "row" }}>
        {/* Aquí se pintan las subrutas (Main / Create) */}
        <Outlet />
        {/* Sidebar derecho común */}
        <RightSidebar />
      </Flex>
    </DashboardLayout>
  );
};

export default CreatorShell;

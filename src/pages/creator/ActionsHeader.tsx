// src/pages/creator/ActionsHeader.tsx
import React from "react";
import { HStack, Button, useColorModeValue } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";

const ActionsHeader: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "whiteAlpha.200");

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <HStack 
      spacing={2} 
      mb={4} 
      p={3} 
      bg={bg} 
      borderWidth="1px" 
      borderColor={border} 
      rounded="lg"
    >
      <Button
        size="sm"
        colorScheme={isActive("/create") ? "teal" : "gray"}
        variant={isActive("/create") ? "solid" : "outline"}
        onClick={() => nav("/creator/create")}
      >
        Create
      </Button>
      <Button
        size="sm"
        colorScheme={isActive("/stock") ? "blue" : "gray"}
        variant={isActive("/stock") ? "solid" : "outline"}
        onClick={() => nav("/creator/stock")}
      >
        Stock
      </Button>
      <Button
        size="sm"
        colorScheme={isActive("/sales") ? "green" : "gray"}
        variant={isActive("/sales") ? "solid" : "outline"}
        onClick={() => nav("/creator/sales")}
      >
        Sales
      </Button>
      {/* Nueva pestaña En Alquiler */}
      <Button
        size="sm"
        colorScheme={isActive("/rentals") ? "purple" : "gray"}
        variant={isActive("/rentals") ? "solid" : "outline"}
        onClick={() => nav("/creator/rentals")}
      >
        Rent
      </Button>
    </HStack>
  );
};

export default ActionsHeader;
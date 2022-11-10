import { Box, Container, Heading } from "@chakra-ui/react";
import React from "react";
import LaptimeOverview from "../components/LaptimeOverview";

const F1Page = () => {
  return (
    <Box minW={"100vw"} minH={"100vh"} bg={"gray.300"}>
      <Container maxW="container.lg" pt={4}>
        <Heading textAlign={"center"} fontSize={"4rem"} mb={4}>
          Top Gear - Inmeta Games
        </Heading>

        <LaptimeOverview />
      </Container>
    </Box>
  );
};

export default F1Page;

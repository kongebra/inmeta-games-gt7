import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightAddon,
  Select,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Score } from "@prisma/client";
import { NextPage } from "next";
import React, { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import usePlayers from "../hooks/use-players";
import useScores from "../hooks/use-scores";
import { Player } from "../types";

const RegisterPage: NextPage = () => {
  const { players } = usePlayers();
  const { scores, upsertScore } = useScores();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const [error, setError] = useState("");

  const form = useForm<Score>();

  const onSubmit = form.handleSubmit((data) => {
    upsertScore
      .mutateAsync(data)
      .then(() => {
        const player = players.find((player) => player._id === data.playerId);
        if (!player) {
          alert("noe gikk galt!");
          return;
        }

        toast({
          title: "Rundetid registrert!",
          description: `${player.firstName} ${player.lastName} (${
            data.min
          }.${String(data.sec).padStart(2, "0")}:${String(data.ms).padStart(
            3,
            "0"
          )})`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        form.reset({
          playerId: "",
          min: 0,
          sec: 0,
          ms: 0,
        });
      })
      .catch((error: Error) => {
        setError(error.message);
        onOpen();
      });
  });

  const sortPlayers = (a: Player, b: Player) => {
    const A = `${a.firstName} ${a.lastName}`;
    const B = `${b.firstName} ${b.lastName}`;

    return A.localeCompare(B);
  };

  const getScore = useCallback((playerId: string) => {
    const found = scores.find((score) => score.playerId === playerId);
    if (found) {
      return ` (${found.min}.${String(found.sec).padStart(2, "0")}:${String(
        found.ms
      ).padStart(3, "0")})`;
    }

    return " (Ingen tid satt enda)";
  }, []);

  return (
    <>
      <Flex w={"100vw"} h={"100vh"} bg="gray.200" alignItems="center">
        <Container maxW="container.sm">
          <Box bg="white" rounded="md" p={8}>
            <form onSubmit={onSubmit}>
              <Heading mb={8} textAlign="center">
                Registrer rundetid
              </Heading>

              <FormControl
                mb={2}
                isInvalid={!!form.formState.errors.playerId?.message}
              >
                <FormLabel>Velg spiller</FormLabel>
                <Select
                  placeholder="Velg en spiller"
                  {...form.register("playerId", {
                    required: "Dette feltet er påkrevd",
                  })}
                  autoFocus
                  size="lg"
                >
                  {players.sort(sortPlayers).map((player) => (
                    <option key={player._id} value={player._id}>
                      {player.firstName} {player.lastName}
                      {getScore(player._id)}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>
                  {form.formState.errors.playerId?.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl
                isInvalid={
                  !!form.formState.errors.min?.message ||
                  !!form.formState.errors.sec?.message ||
                  !!form.formState.errors.ms?.message
                }
                mb={4}
              >
                <FormLabel>Rundetid</FormLabel>
                <Flex gap={2}>
                  <Box>
                    <InputGroup size="lg">
                      <Input
                        type="number"
                        placeholder="min"
                        {...form.register("min", {
                          valueAsNumber: true,
                          required: "Dette feltet er påkrevd",
                          max: {
                            value: 59,
                            message: "Skjerp dæ!",
                          },
                          min: {
                            value: 1,
                            message: "Min 1",
                          },
                        })}
                      />
                      <InputRightAddon children="min" />
                    </InputGroup>
                    <FormErrorMessage>
                      {form.formState.errors.min?.message}
                    </FormErrorMessage>
                  </Box>

                  <Box>
                    <InputGroup size="lg">
                      <Input
                        type="number"
                        placeholder="sec"
                        {...form.register("sec", {
                          valueAsNumber: true,
                          required: "Dette feltet er påkrevd",
                          max: {
                            value: 59,
                            message: "Max 59",
                          },
                          min: {
                            value: 0,
                            message: "Min 0",
                          },
                        })}
                      />
                      <InputRightAddon children="sec" />
                    </InputGroup>
                    <FormErrorMessage>
                      {form.formState.errors.sec?.message}
                    </FormErrorMessage>
                  </Box>

                  <Box>
                    <InputGroup size="lg">
                      <Input
                        type="number"
                        placeholder="ms"
                        {...form.register("ms", {
                          valueAsNumber: true,
                          required: "Dette feltet er påkrevd",
                          max: {
                            value: 999,
                            message: "Max 999",
                          },
                          min: {
                            value: 0,
                            message: "Min 0",
                          },
                        })}
                      />
                      <InputRightAddon children="ms" />
                    </InputGroup>
                    <FormErrorMessage>
                      {form.formState.errors.ms?.message}
                    </FormErrorMessage>
                  </Box>
                </Flex>
              </FormControl>

              <Button type="submit" colorScheme="blue" w="full" size="lg">
                Send inn
              </Button>
            </form>
          </Box>
        </Container>
      </Flex>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Jeg trenger din oppmerksomhet!
            </AlertDialogHeader>

            <AlertDialogBody>{error}</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Lukk
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default RegisterPage;

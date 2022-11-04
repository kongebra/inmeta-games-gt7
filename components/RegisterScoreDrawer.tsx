import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  FormControl,
  FormLabel,
  Select,
  Flex,
  Input,
  DrawerFooter,
  Button,
  InputGroup,
  InputRightAddon,
  Box,
  FormErrorMessage,
} from "@chakra-ui/react";
import { Score } from "@prisma/client";
import React from "react";
import { useForm } from "react-hook-form";
import usePlayers from "../hooks/use-players";
import useScores, { calculateTime } from "../hooks/use-scores";
import players from "../pages/api/players";
import { Player } from "../types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const RegisterScoreDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const { players } = usePlayers();
  const { upsertScore } = useScores();

  const form = useForm<Score>();

  const sortPlayers = (a: Player, b: Player) => {
    const A = `${a.firstName} ${a.lastName}`;
    const B = `${b.firstName} ${b.lastName}`;

    return A.localeCompare(B);
  };

  const handleOnClose = () => {
    form.reset({
      playerId: "",
      min: undefined,
      sec: undefined,
      ms: undefined,
    });
    onClose();
  };

  const onSubmit = form.handleSubmit(async (data) => {
    console.log({ data });

    upsertScore
      .mutateAsync(data)
      .then(() => {
        handleOnClose();
      })
      .catch((error: any) => {
        alert(error);
      });
  });

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={handleOnClose}
        size={"md"}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Registrer rundetid</DrawerHeader>

          <DrawerBody>
            <form id="register-score" onSubmit={onSubmit}>
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
                >
                  {players.sort(sortPlayers).map((player) => (
                    <option key={player._id} value={player._id}>
                      {player.firstName} {player.lastName}
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
              >
                <FormLabel>Sett beste rundetid</FormLabel>
                <Flex gap={2}>
                  <Box>
                    <InputGroup>
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
                            value: 0,
                            message: "Min 0",
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
                    <InputGroup>
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
                    <InputGroup>
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
            </form>
          </DrawerBody>

          <DrawerFooter>
            <Button type="submit" form="register-score" colorScheme={"blue"}>
              Lagre
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default RegisterScoreDrawer;

import { Button, Container, Flex, Stack } from "@chakra-ui/react";
import { Score } from "@prisma/client";
import Link from "next/link";
import React, { useCallback } from "react";
import usePlayers from "../hooks/use-players";
import useScores, { calculateTime } from "../hooks/use-scores";

const Admin = () => {
  const { players } = usePlayers();
  const { scores, deleteScore } = useScores();

  const getPlayerName = useCallback(
    (playerId: string): string => {
      const found = players.find((player) => player._id === playerId);

      if (found) {
        return `${found.firstName} ${found.lastName}`;
      }

      return "FANT IKKE SPILLER";
    },
    [players]
  );

  const onDelete = async (id: number) => {
    await deleteScore.mutateAsync(id);
  };

  const sortScores = (a: Score, b: Score) => {
    const A = calculateTime(a);
    const B = calculateTime(b);

    return A - B;
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Button as={Link} colorScheme="blue" href="/register" mb={8}>
        Gå tilbake
      </Button>

      <Stack>
        {scores.sort(sortScores).map((score) => (
          <Flex
            key={score.id}
            p={8}
            justify="space-between"
            align="center"
            bg="gray.200"
            gap={8}
          >
            <Flex flex="1" justify={"space-between"} align="center">
              <span>
                <strong>{getPlayerName(score.playerId)}</strong>
              </span>

              <span>
                <strong>
                  {score.min}.{score.sec}:{String(score.ms).padStart(3, "0")}
                </strong>
              </span>
            </Flex>

            <Button colorScheme="red" onClick={() => onDelete(score.id)}>
              Slett
            </Button>
          </Flex>
        ))}
      </Stack>
    </Container>
  );
};

export default Admin;

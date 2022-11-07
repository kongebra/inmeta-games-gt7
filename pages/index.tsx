import { useCallback, useEffect, useMemo, useState } from "react";

import { Score } from "@prisma/client";
import { Box, Container, Flex, Heading, Stack, Text } from "@chakra-ui/react";

import usePlayers from "../hooks/use-players";
import useScores, { calculateTime } from "../hooks/use-scores";
import RegisterScoreDrawer from "../components/RegisterScoreDrawer";
import Image from "next/image";
import { useNextSanityImage } from "next-sanity-image";
import { getClient } from "../lib/sanity";
import { Player } from "../types";

type PlayerImageProps = {
  player?: Player;
  size?: number;
};
const PlayerImage: React.FC<PlayerImageProps> = ({ player, size = 32 }) => {
  const [client] = useState(getClient());
  const imageProps = useNextSanityImage(
    client,
    (player?.image as any) || null,
    {
      imageBuilder: (builder) =>
        builder
          .crop("focalpoint")
          .fit("crop")
          .width(size)
          .height(size),
    }
  ) as any;

  if (!player) {
    return null;
  }

  return (
    <Box overflow={"hidden"} rounded="md">
      <Image {...imageProps} alt={player.firstName} className="object-fit" />
    </Box>
  );
};

export default function Home() {
  const { players } = usePlayers();
  const { scores } = useScores();

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

  const sortScores = (a: Score, b: Score) => {
    const A = calculateTime(a);
    const B = calculateTime(b);

    return A - B;
  };

  const [isOpen, setIsOpen] = useState(false);

  const getBgPlacement = (index: number) => {
    switch (index) {
      case 0:
        return "gold";
      case 1:
        return "silver";
      case 2:
        return "orange";
      default:
        return "white";
    }
  };

  const getPlayer = (playerId: string) => {
    return players.find((player) => player._id === playerId);
  };

  const sortedScores = useMemo(() => scores.sort(sortScores), [
    scores,
    sortScores,
  ]);

  const bestLaptime = useMemo(() => {
    if (sortedScores.length > 0) {
      return sortedScores[0];
    }

    return undefined;
  }, [sortedScores]);

  const timeBehindBestTime = useCallback(
    (score: Score) => {
      if (bestLaptime) {
        const bestTime = calculateTime(bestLaptime);
        const thisTime = calculateTime(score);

        const diff = thisTime - bestTime;

        return diff * 60;
      }

      return 0;
    },
    [bestLaptime]
  );

  return (
    <>
      <Box minW={"100vw"} minH={"100vh"} bg={"gray.300"}>
        <Container maxW="container.lg" pt={4}>
          <Heading textAlign={"center"} mb={8} fontSize={"4rem"}>
            Top Gear - Inmeta Games
          </Heading>

          <Stack>
            {scores.sort(sortScores)?.map((score, index) => {
              const timeBehindLeader = timeBehindBestTime(score);

              return (
                <Flex
                  key={score.id}
                  px={4}
                  py={2}
                  bg={getBgPlacement(index)} // TODO: sjekk om noen har samme rundetid
                  justify="space-between"
                  align="center"
                  fontSize="1.75rem"
                  rounded="sm"
                >
                  <Flex align="center" gap={4} flex="1">
                    <Box
                      as="span"
                      minW={8}
                      fontFamily="fantasy"
                      fontWeight="bold"
                    >
                      {index + 1}
                    </Box>

                    <PlayerImage player={getPlayer(score.playerId)} size={50} />
                    <Text fontFamily="fantasy">
                      {getPlayerName(score.playerId)}
                    </Text>
                  </Flex>

                  <Flex fontFamily="monospace" alignItems="center" gap={4}>
                    {timeBehindLeader === 0 ? (
                      <span></span>
                    ) : (
                      <Text fontStyle="italic">
                        {`+${timeBehindLeader.toFixed(3)}sec`}
                      </Text>
                    )}

                    <strong>
                      {score.min}.{String(score.sec).padStart(2, "0")}:
                      {String(score.ms).padStart(3, "0")}
                    </strong>
                  </Flex>
                </Flex>
              );
            })}
          </Stack>
        </Container>
      </Box>

      <RegisterScoreDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

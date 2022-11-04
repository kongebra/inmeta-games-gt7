import { useCallback, useEffect, useState } from "react";

import { Score } from "@prisma/client";
import { Box, Button, Container, Flex, Heading, Stack } from "@chakra-ui/react";

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
        builder.crop("focalpoint").fit("crop").width(size).height(size),
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

  return (
    <>
      <Box minW={"100vw"} minH={"100vh"} bg={"gray.300"}>
        <Container maxW="container.lg" pt={4}>
          <Heading textAlign={"center"} mb={8} fontSize={"4rem"}>
            Top Gear - Inmeta Games
          </Heading>

          <Stack>
            {scores.sort(sortScores)?.map((score, index) => {
              const player = getPlayer(score.playerId);
              return (
                <Flex
                  key={score.id}
                  px={4}
                  py={2}
                  bg={getBgPlacement(index)} // TODO: sjekk om noen har samme rundetid
                  justify="space-between"
                  align="center"
                  fontSize="1.75rem"
                  rounded={"md"}
                  fontFamily="cursive"
                >
                  <Flex align="center" gap={4}>
                    <Box as="span" minW={8}>
                      {index + 1}
                    </Box>
                    <PlayerImage player={getPlayer(score.playerId)} size={50} />
                    <strong>{getPlayerName(score.playerId)}</strong>
                  </Flex>

                  <span>
                    <strong>
                      {score.min}.{String(score.sec).padStart(2, "0")}:
                      {String(score.ms).padStart(3, "0")}
                    </strong>
                  </span>
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

import {
  Box,
  Divider,
  Flex,
  Grid,
  GridItem,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Score } from "@prisma/client";
import React, { useCallback, useMemo } from "react";
import usePlayers from "../hooks/use-players";
import useScores, { calculateTime } from "../hooks/use-scores";

const LaptimeOverview = () => {
  const { scores } = useScores();
  const { players } = usePlayers();

  const getPlayer = useCallback(
    (score: Score) => {
      return players.find((player) => player._id === score.playerId);
    },
    [players, scores]
  );

  const sortScores = (a: Score, b: Score) => {
    const A = calculateTime(a);
    const B = calculateTime(b);

    return A - B;
  };

  const sortedScores = useMemo(() => scores.sort(sortScores), [scores]);

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

  const LEFT_WIDTH = "16rem";

  return (
    <Stack spacing={0} pb={16}>
      <Flex>
        <Flex
          minW={LEFT_WIDTH}
          direction="column"
          justify="center"
          align="center"
          bg="black"
          color="white"
          p={2}
          roundedTopRight="lg"
        >
          <Text fontWeight="bold" fontSize="2rem" lineHeight={1}>
            DAG
          </Text>
          <Text fontWeight="semibold" fontSize="2rem" lineHeight={1}>
            2 / 5
          </Text>
        </Flex>
        <Flex></Flex>
      </Flex>

      {sortedScores.map((score, index) => {
        const player = getPlayer(score);
        const interval = timeBehindBestTime(score);

        if (!player) {
          return <Flex>{"missing player"}</Flex>;
        }

        return (
          <Flex key={score.id}>
            <Flex
              minW={LEFT_WIDTH}
              bg="black"
              color="white"
              align="center"
              gap={4}
              pl={2}
              pb={2}
            >
              <Flex
                bg="white"
                color="black"
                justify="center"
                align="center"
                w={12}
                h={12}
                roundedBottomRight="lg"
              >
                <Text fontWeight="bold" fontSize="2rem">
                  {index + 1}
                </Text>
              </Flex>

              <Flex bg="cyan" p={1} rounded="sm">
                <Image
                  src={getPlayer(score)?.imageUrl}
                  alt={getPlayer(score)?.firstName}
                  w={10}
                  h={10}
                />
              </Flex>

              <Text
                fontWeight="bold"
                fontSize="2rem"
                fontFamily="monospace"
                textTransform="uppercase"
                letterSpacing={2}
              >{`${player.firstName} ${player.lastName}`}</Text>
            </Flex>

            <Flex
              bg="blackAlpha.500"
              color="white"
              px={4}
              pb={2}
              roundedTopRight={index === 0 ? "lg" : undefined}
              roundedBottomRight={
                index === sortedScores.length - 1 ? "lg" : undefined
              }
              justify="flex-end"
              align="center"
              minW="10rem"
            >
              <Flex>
                <Text fontWeight="bold" fontSize="1.5rem">
                  {index === 0 ? "Interval" : `+${interval.toFixed(3)}sec`}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        );
      })}
    </Stack>
  );
};

export default LaptimeOverview;

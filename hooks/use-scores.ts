import { Score } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import usePlayers from "./use-players";

export const calculateTime = (score: Score): number => {
  return score.min + score.sec / 60 + score.ms / (60 * 1000);
};

const fetchScores = async (): Promise<Score[]> => {
  const resp = await fetch("/api/scores");
  return await resp.json();
};

const postScore = async (record: Score) => {
  const scores = await fetchScores();

  const found = scores.find((score) => score.playerId === record.playerId);
  if (found) {
    const recordTime = calculateTime(record);
    const currentTime = calculateTime(found);

    if (currentTime < recordTime) {
      throw new Error(
        `Jeg vil ikke lagre en dårligere tid!\n\nForrige tid: ${found.min}.${
          found.sec
        }:${String(found.ms).padStart(3, "0")}`
      );
    }
  }

  const resp = await fetch("/api/scores", {
    method: "POST",
    body: JSON.stringify(record),
  });
  return await resp.json();
};

const deleteScoreRequest = async (id: number) => {
  const resp = await fetch(`/api/scores/${id}`, { method: "DELETE" });
  return await resp.json();
};

type Props = {
  refetchInterval: number;
};

export default function useScores(
  { refetchInterval }: Props = { refetchInterval: 1000 }
) {
  const queryClient = useQueryClient();

  const { data: scores, ...rest } = useQuery(["scores"], fetchScores, {
    initialData: [],
    refetchInterval,
  });

  const upsertScore = useMutation(postScore, {
    async onSuccess(data, variables, context) {
      queryClient.invalidateQueries(["scores"]);
    },
  });

  const deleteScore = useMutation(deleteScoreRequest, {
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries(["scores"]);
    },
  });

  return {
    scores,
    ...rest,

    upsertScore,
    deleteScore,
  };
}

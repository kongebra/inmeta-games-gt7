import { useQuery } from "@tanstack/react-query";
import { Player } from "../types";

const fetchPlayers = async (): Promise<Player[]> => {
  const resp = await fetch("/api/players");
  return await resp.json();
};

export default function usePlayers() {
  const { data: players, ...rest } = useQuery(["players"], fetchPlayers, {
    initialData: [],
    refetchInterval: 60 * 1000 * 5, // every 5th minute
  });

  return { players, ...rest };
}

import { useQuery } from "@tanstack/react-query";
import { Player } from "../types";

const fetchPlayers = async (): Promise<Player[]> => {
  const resp = await fetch("/api/players");
  return await resp.json();
};

export default function usePlayers() {
  const { data: players, ...rest } = useQuery(["players"], fetchPlayers, {
    initialData: [],
    refetchInterval: 60 * 5000,
  });

  return { players, ...rest };
}

import type { NextApiRequest, NextApiResponse } from "next";
import { playerQuery } from "../../constants";
import { getClient } from "../../lib/sanity";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const players = await getClient().fetch(playerQuery);

  res.status(200).json(players);
}

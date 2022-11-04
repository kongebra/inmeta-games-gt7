import type { NextApiRequest, NextApiResponse } from "next";
import { getClient } from "../../lib/sanity";

const query = `*[_type == "player"][]`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const players = await getClient().fetch(query);

  res.status(200).json(players);
}

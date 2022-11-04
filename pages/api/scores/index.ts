import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import type { Score } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const scores = await prisma.score.findMany();

    return res.status(200).json(scores);
  }

  if (req.method === "POST") {
    const record = JSON.parse(req.body) as Score;

    const result = await prisma.score.upsert({
      where: {
        playerId: record.playerId,
      },
      create: {
        playerId: record.playerId,
        min: record.min,
        sec: record.sec,
        ms: record.ms,
      },
      update: {
        min: record.min,
        sec: record.sec,
        ms: record.ms,
      },
    });

    return res.status(200).json(result);
  }

  return res.status(400).json({ message: "bad request" });
}

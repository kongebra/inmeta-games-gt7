import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import type { Score } from "@prisma/client";
import { getClient } from "../../../lib/sanity";
import { Player } from "../../../types";
import { calculateTime } from "../../../hooks/use-scores";

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

    const players = await getClient().fetch<Player[]>(`*[_type == "player"][]`);
    const scores = await prisma.score.findMany();

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

    const player = players.find((player) => player._id === result.playerId);
    if (!player) {
      throw new Error("noe gikk galt her!!!");
    }

    const laptime = `${result.min}.${String(result.sec).padStart(
      2,
      "0"
    )}:${String(result.ms).padStart(3, "0")}`;
    const fullName = `${player.firstName} ${player.lastName}`;

    const thisTime = calculateTime(result);
    const times = scores.map(calculateTime).sort();

    let bestTime = Infinity;
    if (times.length > 0) {
      bestTime = times[0];
    }

    if (thisTime < bestTime) {
      await sendSlackMessage(
        `*${fullName}* har satt ny beste rundetid: *${laptime}*`
      );

      return res.status(200).json(result);
    }

    const isFirstLaptime = !scores.some((x) => x.playerId === record.playerId);
    if (isFirstLaptime) {
      await sendSlackMessage(
        `*${fullName}* has satt sin første rundetid: *${laptime}*`
      );

      return res.status(200).json(result);
    }

    return res.status(200).json(result);
  }

  return res.status(400).json({ message: "bad request" });
}

async function sendSlackMessage(message: string) {
  await fetch(
    `https://hooks.slack.com/services/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`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: message,
      }),
    }
  );
}

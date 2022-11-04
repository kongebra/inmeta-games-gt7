import type { NextApiRequest, NextApiResponse } from "next";
import { calculateTime } from "../../../hooks/use-scores";
import { prisma } from "../../../lib/prisma";
import { getClient } from "../../../lib/sanity";
import { Player } from "../../../types";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const players = await getClient().fetch<Player[]>(`*[_type == "player"][] {
    ...,
    "imageUrl": image.asset->url
  }`);
  const scores = await prisma.score.findMany();

  const result = scores
    .map((score) => ({
      player: players.find((player) => player._id === score.playerId),
      ...score,
    }))
    .sort((a, b) => {
      const A = calculateTime(a);
      const B = calculateTime(b);

      return A - B;
    });

  res.status(200).json({
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Leaderboard",
        },
      },
      ...result.map((item) => ({
        type: "context",
        elements: [
          {
            type: "image",
            image_url: item.player?.imageUrl || "",
            alt_text: `${item.player?.firstName || ""} ${
              item.player?.lastName || ""
            }`,
          },
          {
            type: "mrkdwn",
            text: `*${item.player?.firstName || ""} ${
              item.player?.lastName || ""
            }*`,
          },
          {
            type: "mrkdwn",
            text: ` `,
          },
          {
            type: "mrkdwn",
            text: ` `,
          },
          {
            type: "mrkdwn",
            text: ` `,
          },
          {
            type: "mrkdwn",
            text: `*${item.min}.${String(item.sec).padStart(2, "0")}:${String(
              item.ms
            ).padStart(3, "0")}*`,
          },
        ],
      })),
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Se live oversikt her:",
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Gå til link",
            emoji: true,
          },
          url: "https://inmeta-games-gt7.vercel.app/",
        },
      },
    ],
  });
}

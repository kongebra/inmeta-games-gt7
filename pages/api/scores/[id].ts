import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export const getQueryNumberValue = (
  key: string,
  req: NextApiRequest
): number | undefined => {
  const query = req.query[key];
  const value = Array.isArray(query) ? query[0] : query;

  const numValue = Number(value);
  if (isNaN(numValue)) {
    return undefined;
  }

  return numValue;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
    const id = getQueryNumberValue("id", req);
    if (!id) {
      return res.status(400).json({ message: "bad request" });
    }

    const result = await prisma.score.delete({
      where: {
        id: id,
      },
    });

    return res.status(200).json(result);
  }

  return res.status(400).json({ message: "bad request" });
}

import prisma from "../lib/prisma";
import { groupStatus } from "./log";

export default async function handler(req, res) {
  let { session } = req.query;
  let user = (
    await prisma.session.findUnique({
      where: {
        id: session,
      },
      include: {
        user: {
          include: {
            group: true
          }
        },
      },
    })
  ).user;

  res.json(await groupStatus(user.group));
}

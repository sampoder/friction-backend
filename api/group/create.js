import prisma from "../../lib/prisma";
import { groupStatus } from "../log";

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
            group: {
              include: {
                users: true
              }
            }
          }
        },
      },
    })
  ).user;

  let group = await prisma.group.create({
    data: { 
      code: Math.random().toString(),
      tzOffset: 0,
      users: {
        connect: { id: user.id },
      },
    },
    include: {
      users: true
    }
  });

  res.json(await groupStatus(group));
}

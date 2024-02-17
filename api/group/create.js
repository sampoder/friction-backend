import prisma from "../../lib/prisma";
import { groupStatus } from "../log";
const friendlyWords = require('friendly-words');

export default async function handler(req, res) {
  let { session } = req.body;
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
      code: `${friendlyWords.predicates[
          Math.floor(Math.random() * friendlyWords.predicates.length)
        ]}-${friendlyWords.predicates[
          Math.floor(Math.random() * friendlyWords.predicates.length)
        ]}-${friendlyWords.teams[
          Math.floor(Math.random() * friendlyWords.teams.length)
        ]}`,
      tzOffset: 0,
      users: {
        connect: { id: user.id },
      },
    },
    include: {
      users: true
    }
  });

  res.json(await groupStatus(group, user));
}

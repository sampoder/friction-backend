import prisma from "../../lib/prisma";
import { groupStatus } from "../log";

export default async function handler(req, res) {
  let { session, tzOffset, startBreak = "none", endBreak  = "none"} = req.body;
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
  )?.user;
  
  let group = await prisma.group.update({
    where: { id: user.group.id },
    data: { tzOffset: parseFloat(tzOffset), startBreak, endBreak },
    include: {
      users: true
    }
  })

  res.json(await groupStatus(group, user));
}

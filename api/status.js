import prisma from "../lib/prisma";
import { groupStatus } from "./log";

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
  )?.user;
  
  if(!user){
    return res.json({ success: false });
  }

  res.json(await groupStatus(user.group, user));
}

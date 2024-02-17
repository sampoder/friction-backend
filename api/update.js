import prisma from "../lib/prisma";
import { groupStatus } from "./log";

export default async function handler(req, res) {
  let { session, image, name, email } = req.body;
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
  
  if(!user || !email || !image || !name){
    return res.json({ success: false });
  }
  
  user = await prisma.user.update({
    where: { id: user.id },
    data: { email, image, name },
  })

  res.json(await groupStatus(user.group, user));
}

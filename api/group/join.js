import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  let { session, code } = req.query;
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

  let group = await prisma.group.upsert({
    where: {
      code
    },
    create: { 
      code,
      tzOffset: 0,
      users: {
        connect: { id: user.id },
      },
    },
    update: {
      users: {
        connect: { id: user.id },
      },
    },
  });

  res.json(group);
}

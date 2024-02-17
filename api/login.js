import prisma from "../lib/prisma";

export default async function handler(req, res) {
  let { email } = req.query;
  let user = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      sessions: {
        create: [{}],
      },
    },
    create: {
      email,
      name: email.split("@")[0],
      image: "https://github.com/hackclub/dinosaurs/raw/main/cooll-dino.png",
      sessions: {
        create: [{}],
      },
      group: {
        create: {
          code: Math.random().toString(),
          tzOffset: 0,
        },
      },
    },
    include: {
      sessions: true,
    },
  });

  let session = user.sessions[user.sessions.length - 1];

  console.log(session.id);

  res.json({ success: true });
}

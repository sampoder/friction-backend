import prisma from "../lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND);

export default async function handler(req, res) {
  console.log("HIHIHI");
  let { email } = req.body;
  if (!email) {
    return res.json({ success: false });
  }
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

  await fetch("https://friction-emails.maggiel.workers.dev", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MAIL_AUTH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "friction@maggieliu.dev",
      to: user.email,
      subject: "Login to Friction",
      htmlMessage: `Your code to login is <i>${session.id}</i>.`,
      textMessage: `Your code to login is ${session.id}.`,
    }),
  });

  return res.json({ success: true });
}

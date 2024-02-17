import prisma from "../lib/prisma";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND);

export default async function handler(req, res) {
  let { email } = req.body;
  if(!email){
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

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: "sam.r.poder@gmail.com" || user.email,
    subject: 'Login to Friction',
    html: `Your code to login is <i>${session.id}</i>.`
  });

  return res.json({ success: true });
}

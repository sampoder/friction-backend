import prisma from "../lib/prisma";

function getStartOfDayInTimezone(timezoneOffset) {
    // Get current date in UTC
    let currentDate = new Date();

    // Adjust for timezone offset
    let timezoneOffsetMillis = timezoneOffset * 60 * 60 * 1000;
    let currentTimezoneDate = new Date(currentDate.getTime() + timezoneOffsetMillis);

    // Set time to start of the day
    currentTimezoneDate.setUTCHours(0);
    currentTimezoneDate.setUTCMinutes(0);
    currentTimezoneDate.setUTCSeconds(0);
    currentTimezoneDate.setUTCMilliseconds(0);

    return currentTimezoneDate;
}

export default async function handler(req, res) {
  let { session, distance } = req.query;
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

  let log = await prisma.scroll.create({
    data: { distance: parseInt(distance), userId: user.id },
  });
  
  let scrolls = await prisma.scroll.findMany({
    where: {
      user: {
        groupId: user.groupId
      },
      createdAt: {
        gte: getStartOfDayInTimezone(user.group.tzOffset)
      },
    }
  })
  
  let sum = 0
  
  scrolls.map(scroll => {
    sum += scroll.distance
  })

  res.json(sum);
}

import prisma from "../lib/prisma";

function isTimeBetween(start_time_str, end_time_str, timezone_offset) {
    // Parse time strings
    let startTimeParts = start_time_str.split(':');
    let endTimeParts = end_time_str.split(':');
    let startTime = new Date();
    startTime.setHours(parseInt(startTimeParts[0]) + timezone_offset);
    startTime.setMinutes(parseInt(startTimeParts[1]));
    
    let endTime = new Date();
    endTime.setHours(parseInt(endTimeParts[0]) + timezone_offset);
    endTime.setMinutes(parseInt(endTimeParts[1]));

    // Get current time
    let currentTime = new Date();
    currentTime.setHours(currentTime.getHours() + timezone_offset);

    // If end time is before start time within the same day, adjust end time to the next day
    if (endTime < startTime) {
        endTime.setDate(endTime.getDate() + 1);
    }

    // Check if current time is not between start and end time
    return !(currentTime >= startTime && currentTime <= endTime);
}

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

export async function groupStatus(group, user){
  let scrolls = await prisma.scroll.findMany({
    where: {
      user: {
        groupId: group.id
      },
      createdAt: {
        gte: getStartOfDayInTimezone(group.tzOffset)
      },
    }
  })
  
  // Delete scrolls that are irrelevant
  /*
  await prisma.scroll.deleteMany({
    where: {
      user: {
        groupId: group.id
      },
      createdAt: {
        lt: getStartOfDayInTimezone(group.tzOffset)
      },
    }
  })*/
  
  let sum = 0
  let blame = {}
  
  scrolls.map(scroll => {
    sum += scroll.distance
    blame[scroll.userId] = blame[scroll.userId] ? blame[scroll.userId] + scroll.distance : scroll.distance
  })
  
  let friction = sum - (((new Date()).getTime() - getStartOfDayInTimezone(group.tzOffset)) / 1000)
  
  if(isTimeBetween(group.startBreak, group.endBreak, group.tzOffset)){
    friction = 50
  }
  
  return {
    group,
    sum,
    blame,
    friction,
    success: true,
    user
  }
}

export default async function handler(req, res) {
  let { session, distance } = req.body;
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

  let log = await prisma.scroll.create({
    data: { distance: parseInt(distance), userId: user.id },
  });

  res.json(await groupStatus(user.group, user));
}

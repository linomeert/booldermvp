import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { Gym, Crag } from './models/Location';
import { User } from './models/User';
import { Session } from './models/Session';
import { Climb } from './models/Climb';
import { Friendship } from './models/Friendship';
import { Notification } from './models/Notification';
import { config } from './config/config';

const grades = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'];
const styles = ['flash', 'redpoint', 'onsight'];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🌱 Starting seed...');

  await mongoose.connect(config.mongodbUri);
  console.log('✅ Database connected');

  // Clear existing data
  await User.deleteMany({});
  await Session.deleteMany({});
  await Climb.deleteMany({});
  await Friendship.deleteMany({});
  await Notification.deleteMany({});
  await Gym.deleteMany({});
  await Crag.deleteMany({});

  // Create gyms
  const gym1 = await Gym.create({
    name: 'Boulder Central',
    city: 'Amsterdam',
    country: 'Netherlands',
  });

  const gym2 = await Gym.create({
    name: 'Momentum Climbing',
    city: 'Utrecht',
    country: 'Netherlands',
  });

  const gym3 = await Gym.create({
    name: 'The Climb',
    city: 'Rotterdam',
    country: 'Netherlands',
  });

  const gym4 = await Gym.create({
    name: 'Petit ile',
    city: 'Réunion',
    country: 'France',
  });

  // Create crags
  const crag1 = await Crag.create({
    name: 'Fontainebleau',
    area: 'Île-de-France',
    country: 'France',
  });

  const crag2 = await Crag.create({
    name: 'Magic Wood',
    area: 'Graubünden',
    country: 'Switzerland',
  });

  const locations = [
    { type: 'indoor', id: gym1._id },
    { type: 'indoor', id: gym2._id },
    { type: 'indoor', id: gym3._id },
    { type: 'outdoor', id: crag1._id },
    { type: 'outdoor', id: crag2._id },
  ];

  // Create users with local avatars
  const password = await bcrypt.hash('password123', 10);
  const userNames = [
    { name: 'Lino Meert', username: 'linomeert', email: 'lino.meert@gmail.com', gender: 'male', avatarNum: 13 },
    { name: 'Alex Johnson', username: 'alexj', gender: 'male', avatarNum: 5 },
    { name: 'Sam Rivera', username: 'samr', gender: 'female', avatarNum: 3 },
    { name: 'Jordan Chen', username: 'jordanc', gender: 'male', avatarNum: 7 },
    { name: 'Taylor Smith', username: 'taylors', gender: 'female', avatarNum: 4 },
    { name: 'Morgan Lee', username: 'morganl', gender: 'male', avatarNum: 8 },
    { name: 'Casey Brown', username: 'caseyb', gender: 'female', avatarNum: 6 },
    { name: 'Riley Davis', username: 'rileyd', gender: 'male', avatarNum: 9 },
    { name: 'Avery Wilson', username: 'averyw', gender: 'female', avatarNum: 10 },
    { name: 'Quinn Martinez', username: 'quinnm', gender: 'male', avatarNum: 11 },
    { name: 'Jamie Garcia', username: 'jamieg', gender: 'female', avatarNum: 12 },
  ];

  const users = [];
  for (const userData of userNames) {
    const avatarPath = userData.gender === 'male' ? 'users-male' : 'users-female';
    const user = await User.create({
      name: userData.name,
      username: userData.username,
      email: userData.email || `${userData.username}@example.com`,
      password,
      avatarUrl: `/avatars/${avatarPath}/uifaces-popular-avatar (${userData.avatarNum}).jpg`,
    });
    users.push(user);
  }

  console.log('✅ Created 11 users');

  // Create accepted friendships between first 5 users
  const friendGroup = users.slice(0, 5);
  for (let i = 0; i < friendGroup.length; i++) {
    for (let j = i + 1; j < friendGroup.length; j++) {
      await Friendship.create([
        { userId: friendGroup[i]._id, friendId: friendGroup[j]._id, status: 'accepted' },
        { userId: friendGroup[j]._id, friendId: friendGroup[i]._id, status: 'accepted' },
      ]);
    }
  }

  // Create friendships for Lino (users[0]) with 3 users outside the first 5
  const linoUser = users[0];
  const randomFriends = [users[6], users[7], users[9]]; // Riley, Avery, Jamie
  for (const friend of randomFriends) {
    await Friendship.create([
      { userId: linoUser._id, friendId: friend._id, status: 'accepted' },
      { userId: friend._id, friendId: linoUser._id, status: 'accepted' },
    ]);
  }

  console.log('✅ Created friendships for first 5 users and Lino');

  // Create 2-3 sessions per user with climbs
  for (const user of users) {
    const numSessions = randomInt(2, 3);

    for (let i = 0; i < numSessions; i++) {
      const location = randomElement(locations);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - randomInt(1, 30));
      
      const sessionData: any = {
        userId: user._id,
        locationType: location.type,
        startedAt: startDate,
      };

      if (location.type === 'indoor') {
        sessionData.gymId = location.id;
      } else {
        sessionData.cragId = location.id;
      }

      // Create session
      const session = await Session.create(sessionData);

      // Add 5-12 climbs to the session
      const numClimbs = randomInt(5, 12);
      let topsCount = 0;
      let projectsCount = 0;
      let hardestGrade = 'V0';

      for (let j = 0; j < numClimbs; j++) {
        const climbDate = new Date(startDate);
        climbDate.setMinutes(climbDate.getMinutes() + j * 10);
        
        const status = Math.random() > 0.3 ? 'top' : 'project';
        const grade = randomElement(grades);
        
        if (status === 'top') topsCount++;
        if (status === 'project') projectsCount++;
        
        // Update hardest grade (simplified)
        if (parseInt(grade.substring(1)) > parseInt(hardestGrade.substring(1))) {
          hardestGrade = grade;
        }

        const climbData: any = {
          userId: user._id,
          sessionId: session._id,
          status,
          locationType: location.type,
          grade,
          style: status === 'top' ? randomElement(styles) : undefined,
          attempts: status === 'project' ? randomInt(2, 8) : randomInt(1, 3),
          createdAt: climbDate,
        };

        if (location.type === 'indoor') {
          climbData.gymId = location.id;
        } else {
          climbData.cragId = location.id;
        }

        await Climb.create(climbData);
      }

      // End session and update stats
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + randomInt(2, 4));
      const durationSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);

      await Session.findByIdAndUpdate(session._id, {
        endedAt: endDate,
        durationSeconds,
        climbCount: numClimbs,
        topsCount,
        projectsCount,
        hardestGrade,
      });
    }
  }

  console.log('✅ Created sessions and climbs for all users');
  console.log('✅ Seed completed!');
  console.log('📊 Summary:');
  console.log('  - 11 users created (password: password123)');
  console.log('  - Lino Meert (lino.meert@gmail.com) friends with Riley, Avery, and Jamie');
  console.log('  - First 5 users are friends with each other');
  console.log('  - 4 gyms and 2 crags created');
  console.log('  - Each user has 2-3 sessions with 5-12 climbs each');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

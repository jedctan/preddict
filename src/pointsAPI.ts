import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redis: true,
});


// Fetch the user's points from the sorted set
export async function fetchUserPoints(context: Devvit.Context, userId: string): Promise<number> {
  const points = await context.redis.zScore('userPoints', userId);
  if (points === null || points === undefined) {
    await context.redis.zAdd('userPoints', { score: 0, member: userId });
    return 0;
  }
  return points;
}

// Update the user's points by the given delta
  export async function updateUserPoints(context: Devvit.Context, userId: string, delta: number): Promise<void> {
    await context.redis.zIncrBy('userPoints', userId, delta);
  }





// Check if the user is new by checking if they have a score in the sorted set
  export async function isNewUser(context: Devvit.Context, userId: string): Promise<boolean> {
    const score = await context.redis.zScore('userPoints', userId);
    return score === undefined;
  }





// Add a new user to the sorted set with a score of 0
  export async function addNewUser(context: Devvit.Context, userId: string, userName: string): Promise<void> {
    const nameKey = `user:${userId}:name`;
    const giftKey = `user:${userId}:dailyGift`;

    // Add user to the sorted set with initial score of 0
    await context.redis.zAdd('userPoints', { score: 0, member: userId });
    
    // Set the user's name
    await context.redis.set(nameKey, userName);

    const userNametest = await context.redis.get(nameKey) || 'Unknown';
      console.log('Adding name:', userNametest);

    await context.redis.set(giftKey, 'false');

  }


// Fetch the top 5 users by points
  export async function fetchTopUsers(context: Devvit.Context): Promise<Array<{ userName: string, points: number }>> {
    // Use ZRANGE to get the top 5 users by points, in reverse order
    const topUsers = await context.redis.zRange('userPoints', 0, 4, { by: 'rank', reverse: true });
    console.log('Top users:', topUsers);
    // Fetch names for each user and create the result array
    const result = await Promise.all(topUsers.map(async ({ member: userId, score }) => {
      const nameKey = `user:${userId}:name`;
      console.log('Fetching name for user:', nameKey);
      const userName = await context.redis.get(nameKey) || 'Unknown';
      console.log('Fetched name:', userName);
      return { userName, points: Number(score) };
    }));
  
    return result;
  }


// Fetch the status of the user's daily gift
export async function fetchDailyGiftStatus(context: Devvit.Context, userId: string): Promise<boolean> {
    const giftKey = `user:${userId}:dailyGift`;
    const value = await context.redis.get(giftKey);
    // If no value is found, default to false (gift not claimed)
    return value === 'true';
  }

// Update the user's daily gift status
  export async function updateGiftKey(context: Devvit.Context, userId: string): Promise<void> {
    const giftKey = `user:${userId}:dailyGift`; 
    await context.redis.set(giftKey, 'true');
    await context.redis.expire(giftKey, 86400);
}



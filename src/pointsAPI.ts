import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redis: true,
});

export async function fetchUserPoints(context: Devvit.Context, userId: string): Promise<number> {
    const key = `user:${userId}:points`;
    const points = await context.redis.get(key);
    if (points === null || points === undefined) {
      await context.redis.set(key, '0');
      return 0;
    }
    return parseInt(points, 10);
  }
  
  export async function updateUserPoints(context: Devvit.Context, userId: string, delta: number): Promise<void> {
    const key = `user:${userId}:points`;
    await context.redis.incrBy(key, delta);
  }

  export async function isNewUser(context: Devvit.Context, userId: string): Promise<boolean> {
    const key = `user:${userId}:points`;
    const points = await context.redis.get(key);
    return points === null || points === undefined;
  }


  export async function addNewUser(context: Devvit.Context, userId: string): Promise<void> {
    const pointsKey = `user:${userId}:points`;
    const giftKey = `user:${userId}:dailyGift`;
    
    // Set initial points to 0
    await context.redis.set(pointsKey, '0');
    // Set daily gift status to false (as a string)
    await context.redis.set(giftKey, 'false');
  }




export async function fetchDailyGiftStatus(context: Devvit.Context, userId: string): Promise<boolean> {
    const giftKey = `user:${userId}:dailyGift`;
    const value = await context.redis.get(giftKey);
    // If no value is found, default to false (gift not claimed)
    return value === 'true';
  }


  export async function updateGiftKey(context: Devvit.Context, userId: string): Promise<void> {
    const giftKey = `user:${userId}:dailyGift`; 
    await context.redis.set(giftKey, 'true');
    await context.redis.expire(giftKey, 86400);
}

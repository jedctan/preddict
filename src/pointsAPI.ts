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
  export async function addNewUser(context: Devvit.Context, userId: string, userName: string ): Promise<void> {
    const nameKey = `user:${userId}:name`;
    const giftKey = `user:${userId}:dailyGift`;
    const pollsKey = `user:${userId}:polls`;


    // Add user to the sorted set with initial score of 0
    await context.redis.zAdd('userPoints', { score: 0, member: userId });
    await context.redis.zAdd('userGuesses', { score: 0, member: userId });

    
    // Set the user's name
    await context.redis.set(nameKey, userName);

    const userNametest = await context.redis.get(nameKey) || 'Unknown';
      console.log('Adding name:', userNametest);

    await context.redis.set(giftKey, 'false');
   
    await context.redis.hSet(pollsKey, {});

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

  export async function fetchTopUsers_Guesses(context: Devvit.Context): Promise<Array<{ userName: string, guesses: number }>> {
    // Use ZRANGE to get the top 5 users by points, in reverse order
    const topUsers = await context.redis.zRange('userGuesses', 0, 4, { by: 'rank', reverse: true });
    console.log('Top users Guesses:', topUsers);
    // Fetch names for each user and create the result array
    const result = await Promise.all(topUsers.map(async ({ member: userId, score }) => {
      const nameKey = `user:${userId}:name`;
      console.log('Fetching name for user:', nameKey);
      const userName = await context.redis.get(nameKey) || 'Unknown';
      console.log('Fetched name:', userName);
      return { userName, guesses: Number(score) };
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


// Fetch the user's guesses
export async function fetchUserGuesses(context: Devvit.Context, userId: string): Promise<number> {
  const guesses = await context.redis.zScore('userGuesses', userId);
  if (guesses === null || guesses === undefined) {
    await context.redis.zAdd('userGuesses', { score: 0, member: userId });
    return 0;
  }
  return guesses;
}


// Update the user's guesses
export async function updateUserGuesses(context: Devvit.Context, userId: string): Promise<void> {
  await context.redis.zIncrBy('userGuesses', userId, 1);
}







export async function saveFormData( context: Devvit.Context,  postId: string,  userId: string,  question: string,  options: string[] ): Promise<void> {
    // Create key for storing poll data
    const pollKey = `poll:${postId}`;
  
    // Use a transaction to ensure all operations complete together
    const txn = await context.redis.watch(pollKey);
    await txn.multi();
    
    // Create options dictionary with initial vote counts
    const optionsDict: Record<string, string> = {};
    for (let i = 0; i < options.length; i++) {
      optionsDict[options[i]] = '0';
    }
    
    // Store poll metadata including the options dictionary
    await txn.hSet(pollKey, {
      postId,
      authorId: userId,
      question,
      createdAt: Date.now().toString(),
      optionCount: options.length.toString(),
      options: JSON.stringify(optionsDict), // Store options dictionary as a JSON string
      voters: JSON.stringify([])
    });
    
    // Execute all commands atomically
    await txn.hSet(`user:${userId}:polls`, { [postId]: question });

    await txn.exec();
    
    console.log('Poll data saved for post:', postId);
  }




  export async function getUserPolls(context: Devvit.Context, userId: string): Promise<Record<string, string>> {
    const pollsKey = `user:${userId}:polls`;
    
    // Get all polls for this user - this returns a dictionary with question as key and postId as value
    const polls = await context.redis.hGetAll(pollsKey);
    
    return polls || {};
  }



  export async function getPollData(context: Devvit.Context, postId: string): Promise<Record<string, string>> {
    const pollKey = `poll:${postId}`;
    const pollData = await context.redis.hGetAll(pollKey);
    return pollData || {};
  }

  export async function addVote(context: Devvit.Context,  pollId: string, option: string, userId: string): Promise<void> {
  
      // Create key for storing poll data
      const pollKey = `poll:${pollId}`;
      
      // Use a transaction to ensure all operations complete atomically
      const txn = await context.redis.watch(pollKey);
      
      try {
        // Get current poll data
        const pollData = await context.redis.hGetAll(pollKey);
        
        if (!pollData || !pollData.options) {
          throw new Error('Poll not found');
        }
        
        // Parse the options and voters from strings to objects
        const options = JSON.parse(pollData.options);
        const voters = JSON.parse(pollData.voters || '[]');
        
        // Check if user has already voted
        if (voters.includes(userId)) {
          throw new Error('You have already voted in this poll');
        }
        
        // Check if the option exists
        if (!(option in options)) {
          throw new Error('Invalid option');
        }
        
        // Start transaction
        await txn.multi();
        
        // Increment the vote count for the selected option
        const currentVotes = parseInt(options[option] || '0', 10);
        options[option] = (currentVotes + 1).toString();
        
        // Add user to voters list
        voters.push(userId);
        
        // Update the poll data
        await txn.hSet(pollKey, {
          options: JSON.stringify(options),
          voters: JSON.stringify(voters)
        });
        
        // Execute the transaction
        await txn.exec();
        
        console.log(`Vote added for option "${option}" in poll ${pollId} by user ${userId}`);
      } catch (error) {
        // If there's an error, the transaction will be automatically discarded
        console.error('Error adding vote:', error);
        throw error;
      }
    }
  
  export async function getPostType(context: Devvit.Context, postId: string): Promise<string | null> {
    const pollKey = `poll:${postId}`;
    const postType = await context.redis.hGet(pollKey, 'postType');
    return postType || null; // Return null if "postType" does not exist (meaning it's not pinned)
  }
  
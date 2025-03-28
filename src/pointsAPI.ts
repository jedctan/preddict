import { Devvit, JobContext  } from '@devvit/public-api';

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
    const votersKey = `poll:${postId}:voters`;
    await context.redis.zAdd(votersKey, { score: 0, member: "placeholder" });
    await context.redis.zRem(votersKey, ["placeholder"]); // Optional: remove it right away

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
  export async function addVote(context: Devvit.Context, pollId: string, option: string, userId: string): Promise<void> {
    // Create keys for storing poll data
    const pollKey = `poll:${pollId}`;
    const votersKey = `poll:${pollId}:voters`;
    
    try {
      // Check if user has already voted
      const hasVotedinfo = await hasUserVoted(context, pollId, userId);
      const { hasVoted, votedOption } = hasVotedinfo;


      if (hasVoted) {
        throw new Error('You have already voted in this poll');
      }
      
      // Get current poll data
      const pollData = await context.redis.hGetAll(pollKey);
      
      if (!pollData || !pollData.options) {
        throw new Error('Poll not found');
      }
      
      // Parse the options from string to object
      const options = JSON.parse(pollData.options);
      
      // Check if the option exists
      if (!(option in options)) {
        throw new Error('Invalid option');
      }
      
      // Start transaction
      const txn = await context.redis.watch(pollKey);
      await txn.multi();
      
      // Increment the vote count for the selected option
      const currentVotes = parseInt(options[option] || '0', 10);
      options[option] = (currentVotes + 1).toString();
      
      // Update the poll options
      await txn.hSet(pollKey, {
        options: JSON.stringify(options)
      });
      
      // Add user to voters sorted set with current timestamp as score
      await txn.zAdd(votersKey, { score: Date.now(), member: `${userId}:${option}` });
      
      // Execute the transaction
      await txn.exec();
      
      console.log(`Vote added for option "${option}" in poll ${pollId} by user ${userId}`);
    } catch (error) {
      console.error('Error adding vote:', error);
      throw error;
    }
  }



    export async function hasUserVoted(context: Devvit.Context, pollId: string, userId: string): Promise<{ hasVoted: boolean; votedOption: string | null }> {
      // Create the key for the voters sorted set
      const votersKey = `poll:${pollId}:voters`;
      
      try {

        
        // Get all members from the sorted set
        const members = await context.redis.zRange(votersKey, 0, -1);
        console.log(`Members without by:score:`, JSON.stringify(members));

        // Find any member that starts with the userId
        const userVote = members.find(item => item.member.startsWith(`${userId}:`));
        console.log(`User vote found:`, userVote);

        if (userVote != undefined) {
          // Extract the option from the member string (format: "userId:option")
          const votedOption = userVote.member.split(':')[1];
          
          console.log(`User ${userId} has voted in poll ${pollId}: true`);
          console.log(`Voted for option: ${votedOption}`);
          
          return { hasVoted: true, votedOption };
        }
        
        console.log(`User ${userId} has voted in poll ${pollId}: false`);
        return { hasVoted: false, votedOption: null };
      } catch (error) {
        console.error(`Error checking if user ${userId} voted in poll ${pollId}:`, error);
        return { hasVoted: false, votedOption: null }; // Default to false in case of error
      }
    }







export async function finializePoll(context: Devvit.Context, pollId: string, answer: string): Promise<void> {

  const votersKey = `poll:${pollId}:voters`;
 
  const pollKey = `poll:${pollId}`;
  const pollData = await context.redis.hGetAll(pollKey);
  
  if (!pollData || !pollData.options) {
    throw new Error('Poll not found or has no options');
  }
  
  // Parse the options from JSON string
  const options = JSON.parse(pollData.options);
  
  // Calculate total votes
  let totalVotes = 0;
  Object.values(options).forEach(votes => {
    totalVotes += parseInt(votes as string, 10);
  });
  
  // Calculate percentages for each option
  const percentages: Record<string, number> = {};
  
  Object.entries(options).forEach(([option, votes]) => {
    const voteCount = parseInt(votes as string, 10);
    console.log(`Votes for ${option}: ${voteCount}`);
    // Calculate percentage and round to 1 decimal place
    const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 1000) / 10 : 0;
    console.log(`Percentage for ${option}: ${percentage}`);
    percentages[option] = (percentage/ 100);
  });

  if (!(answer in percentages)) {
    console.error(`Answer "${answer}" not found in poll options`);
    // Either return early or set a default value
    return; // Or set correctPercentage to a default value
  }

  const correctPercentage = percentages[answer] ;
  console.log(`Correct percentage for ${answer}: ${correctPercentage}`);

  const members = await context.redis.zRange(votersKey, 0, -1);


  const MAX_POINTS = 100;
  let points = 0;


  for (const member of members) {
    console.log(member);
    const votedOption = member.member.split(':')[1];
    const userId = member.member.split(':')[0];
    const userPercentage = percentages[votedOption];

    if( votedOption === answer){
      const userId = member.member.split(':')[0];
      await updateUserGuesses(context, userId);
      const confidenceGap = correctPercentage - Math.max(
        ...Object.values(percentages)
          .filter(p => p !== correctPercentage) // safer than comparing raw float
      );
      const closeness = 1 - confidenceGap;
      points = Math.max(5, Math.round(closeness * MAX_POINTS));
      console.log(`User Voted Correct`);

    }else{

      const wrongness = correctPercentage - userPercentage;
      points = -Math.round(wrongness * MAX_POINTS);
      console.log(`User Voted InCorrect`);
    }

    console.log(`User ${userId} voted for ${votedOption} and got ${points} points`);

    await updateUserPoints(context, userId, points);
  }

}



export async function GetEndedPolls(context: Devvit.Context): Promise<Array<{ pollId: string}>> {
  const endedPollsKey = "ended_polls_list";
  const endedPolls = await context.redis.zRange(endedPollsKey, 0, -1);



  return endedPolls.map(poll => ({ pollId: poll.member }));
}

export async function addToEndedPost(context: JobContext, pollId: string): Promise<void> {
  try {
    // Get the current list of ended polls from Redis
    const endedPollsKey = "ended_polls_list";
    await context.redis.zAdd(endedPollsKey, {member: pollId, score: Date.now()});
    console.log(`Poll ${pollId} added to ended posts`);
    // Parse the JSON string to get the array
  } catch (error) {
    // Log any errors that occur
    console.error(`Failed to add poll ${pollId} to ended posts: ${error}`);
  }
}


export async function removeFromEndedPost(context: Devvit.Context, pollId: string): Promise<void> {
  try {
    // Use the same key as in the addToEndedPost function
    const endedPollsKey = "ended_polls_list";
    
    // Remove the poll from the sorted set
    await context.redis.zRem(endedPollsKey, [pollId]);
    
    console.log(`Poll ${pollId} removed from ended posts`);
  } catch (error) {
    // Log any errors that occur
    console.error(`Failed to remove poll ${pollId} from ended posts: ${error}`);
  }
}
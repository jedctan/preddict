import { Devvit, useAsync, useState ,useInterval} from '@devvit/public-api';
// Import the necessary functions
import { getPollData, hasUserVoted , isExpiredPoll, isNewUser, addNewUser} from './pointsAPI.js'; 
import { addVote } from './pointsAPI.js';

interface ShowPollProps {
  pollId: string;
  onBack: () => void;
  context: Devvit.Context;
}

const ShowPoll = ({ pollId, onBack, context }: ShowPollProps) => {
  // Add a refresh counter to trigger re-fetches
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Fetch the poll details and check if user has voted in parallel
  const { data, loading, error } = useAsync(async () => {
    const [pollData, userVoteInfo, pollExpired] = await Promise.all([
      getPollData(context, pollId),
      hasUserVoted(context, pollId, context.userId || ''),
      isExpiredPoll(context, pollId)
    ]);
    
    return {
      pollData,
      userVoteInfo,
      pollExpired
    };
  }, {
    depends: [refreshCounter] // This will re-run the async function when refreshCounter changes
  });

  // Function to manually trigger a refresh
  const refetch = () => {
    setRefreshCounter(prev => prev + 1);
  };

  if (loading) {
    return <text>Loading poll details...</text>;
  }

  if (error) {
    return <text color="red">Error loading poll: {error.message}</text>;
  }

  if (!data || !data.pollData || Object.keys(data.pollData).length === 0) {
    return <text color="red">Poll not found or data is empty</text>;
  }

  const { pollData, userVoteInfo , pollExpired } = data;
  const { hasVoted, votedOption } = userVoteInfo;
  

  //console.log("hasVoted value:", hasVoted);
  //console.log("votedOption value:", votedOption);
  //console.log("userVoteInfo:", userVoteInfo);
  const userHasVoted = hasVoted === true; // Force boolean evaluation
  let disableButtons = false;
  if (pollExpired|| userHasVoted) {
    disableButtons = true; // Disable buttons if poll is expired or user has voted
  }
  // Parse the options from JSON string back to an object
  const options = pollData.options ? JSON.parse(pollData.options) : {};
  
  const createdDate = pollData.createdAt 
    ? new Date(parseInt(pollData.createdAt)).toLocaleDateString() 
    : 'Unknown date';

  const expirationDate = data?.pollData.expiration ? new Date(data.pollData.expiration).toLocaleString() : 'No expiration';


  useInterval(() => {
    if (data?.pollData?.expiration) {
      const expirationTime = new Date(data.pollData.expiration).getTime();
      const currentTime = Date.now();
      
      // If current time has passed expiration time and poll isn't marked as expired yet
      if (currentTime >= expirationTime && !pollExpired) {
        // Trigger a refresh
        setRefreshCounter(prev => prev + 1);
      }
    }
  }, 10000);

  
  const handleVote = async (option: string) => {
    try {
      // Double-check if user has already voted
      if (userHasVoted) {
        context.ui.showToast('You have already voted in this poll');
        return;
      }

      const { data: currentUser, loading: userLoading, error: userError } = useAsync(async () => {
          const user = await context.reddit.getCurrentUser();
          return user ? { id: user.id, name: user.username } : null;
        });
        //Checks if the user is new or not
        const { data: userIsNew, loading: newUserLoading, error: newUserError } = useAsync(
          async () => {
            if (!currentUser?.id) return false;
            return await isNewUser(context, currentUser.id);
          },
          { depends: [currentUser?.id ?? null] }
        );
      
        // If user is new, add them to the database (this useAsync runs when userIsNew is available)
        useAsync(
          async () => {
            if (userIsNew && currentUser?.id) {
              await addNewUser(context, currentUser.id , currentUser.name);
              return true;
            }
            return false;
          },
          { depends: [userIsNew, currentUser?.id ?? null] }
        );
      
      
      await addVote(context, pollId, option, context.userId || 'Default');
      // Use our custom refetch function
      refetch();
      context.ui.showToast(`Vote recorded for "${option}"`);
    } catch (err) {
      context.ui.showToast(`Error recording vote: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <vstack gap="medium" padding="medium">
      <hstack>
        <button icon="back" onPress={onBack}>Back to Polls</button>
        <spacer />
      </hstack>
      
      <vstack gap="medium" padding="medium" border="thin" cornerRadius="medium">
        <text size="xlarge" weight="bold">{pollData.question}</text>
        <text size="small">Created: {createdDate}</text>
        <text size="small">Expires: {expirationDate}</text>
        <vstack gap="small" padding="small">
          <text weight="bold">Poll Options:</text>
          {Object.entries(options).map(([option, votes], index) => {
            // Check if this is the option the user voted for
            const isUserVote = userHasVoted && votedOption === option;
            
            return (
              <hstack key={index.toString()} gap="small" alignment="center">
                <button 
                 appearance="primary"
                  onPress={() => handleVote(option)}
                  grow
                  disabled={disableButtons} // Disable all buttons if user has voted
                >
                  {isUserVote ? `${option} ✓` : option}
                </button>
                <text>{typeof votes === 'string' ? votes : String(votes)} votes</text>
              </hstack>
            );
          })}
        </vstack>
        
        <hstack>
          <text size="small">Total Options: {pollData.optionCount || '0'}</text>
          <spacer />
          {userHasVoted && <text size="small" color="secondary">You voted for: {votedOption}</text>}
        </hstack>
      </vstack>
    </vstack>
  );
};

export default ShowPoll;
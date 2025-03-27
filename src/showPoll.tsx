import { Devvit, useAsync, useState } from '@devvit/public-api';
// Import the getPollData function from wherever it's correctly exported
import { getPollData } from './pointsAPI.js'; 
import { addVote } from './pointsAPI.js';

interface ShowPollProps {
  pollId: string;
  onBack: () => void;
  context: Devvit.Context;
}

const ShowPoll = ({ pollId, onBack, context }: ShowPollProps) => {
  // Add a refresh counter to trigger re-fetches
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Fetch the poll details using the pollId
  const { data: pollData, loading, error } = useAsync(async () => {
    return await getPollData(context, pollId);
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

  if (!pollData || Object.keys(pollData).length === 0) {
    return <text color="red">Poll not found or data is empty {pollId} </text>;
  }

  // Rest of your code remains the same
  const options = pollData.options ? JSON.parse(pollData.options) : {};
  
  const createdDate = pollData.createdAt 
    ? new Date(parseInt(pollData.createdAt)).toLocaleDateString() 
    : 'Unknown date';

  const handleVote = async (option: string) => {
    try {
      await addVote(context, pollId, option, context.userId|| "Default");
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
        
        <vstack gap="small" padding="small">
          <text weight="bold">Poll Options:</text>
          {Object.entries(options).map(([option, votes], index) => (
            <hstack key={index.toString()} gap="small" alignment="center">
              <button 
                appearance="secondary"
                onPress={() => handleVote(option)}
                grow
              >
                {option}
              </button>
              <text>{typeof votes === 'string' ? votes : String(votes)} votes</text>
            </hstack>
          ))}
        </vstack>
        
        <hstack>
          <text size="small">Total Options: {pollData.optionCount || '0'}</text>
          <spacer />
        </hstack>
      </vstack>
    </vstack>
  );
};

export default ShowPoll;
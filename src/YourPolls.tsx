import { Devvit, useState, useAsync, Context } from '@devvit/public-api';
// Import your ShowPoll component
import ShowPoll from './showPoll.js'; // Adjust the path as needed
import {getUserPolls} from './pointsAPI.js'; // Adjust the path as needed
// Function to get user polls from Redis


const YourPolls = (context: Context) => {
  // Add state to track which poll to show
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  
  // Use useAsync to fetch polls data
  const { data: polls, loading, error } = useAsync(
    async () => {
      // Make sure we have a userId
      if (!context.userId) {
        throw new Error("You need to be logged in to view your polls");
      }
      
      // Get polls for the current user
      return await getUserPolls(context, context.userId);
    }
  );

  // If a poll is selected, show the ShowPoll component
  if (selectedPollId) {
    return <ShowPoll pollId={selectedPollId} onBack={() => setSelectedPollId(null)} context={context} />;
  }

  // Render loading state
  if (loading) {
    return <text>Loading your polls...</text>;
  }

  // Render error state
  if (error) {
    return <text color="red">{error.message}</text>;
  }

  // Render empty state
  if (!polls || Object.keys(polls).length === 0) {
    return <text>You haven't created any polls yet.</text>;
  }

  // Render polls list
  return (
    <vstack gap="medium" padding="medium">
      <text size="large" weight="bold">Your Polls</text>
      <vstack gap="small">
        {Object.entries(polls).map(([pollId, question], index) => (
          <hstack key={index.toString()} gap="small" alignment="center">
            <text>{question}</text>
            <spacer />
            <button 
              size="small" 
              onPress={() => {
                // Set the selected poll ID to trigger showing the poll
                setSelectedPollId(pollId);
              }}
            >
              View
            </button>
          </hstack>
        ))}
      </vstack>
    </vstack>
  );
};

export default YourPolls;
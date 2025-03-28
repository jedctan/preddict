
import { Devvit, useState, useAsync , Context , useForm, FormField, ValidatedFormField, ValidatedSelectField , SettingScope } from '@devvit/public-api';
import DropDownMenu from './dropDownMenu.js';
import { Router } from './Router.js';
<<<<<<< HEAD
import PollForm from './PollCreate.js';
import {addToEndedPost, GetEndedPolls, getPollData, finializePoll, removeFromEndedPost} from './pointsAPI.js';

=======
import { newPinnedPost } from './newPinnedPost.js';
>>>>>>> pinned-post

Devvit.addMenuItem({
  label: 'Add my post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    ui.showToast("Submitting your post - upon completion you'll navigate there.");

    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: 'My devvit post',
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    ui.navigateTo(post);
  },
});

// Add option to create new pinned post
Devvit.addMenuItem(newPinnedPost);

// Configure Devvit
Devvit.configure({
  redditAPI: true,
  redis: true,
});



// Add your custom post type
// Devvit.addCustomPostType({
//   name: 'Combined Experience Post',
//   render: (context) => { 
//     return (
//       <vstack>
//         <DropDownMenu {...context} />
//       </vstack>
//     );
//   },
// });

Devvit.addCustomPostType({
  name: 'Combined Experience Post',
  height: 'tall',
  render: Router,
});



<<<<<<< HEAD
export const POLL_EXPIRATION_JOB = 'poll-expiration';

Devvit.addSchedulerJob({
  name: POLL_EXPIRATION_JOB,
  onRun: async (event, context) => {
    const { postId, question } = event.data!;
    
    const strPostId = event.data!.postId as string;


    const post = await context.reddit.getPostById(strPostId);

    // Get the post
    await addToEndedPost(context, strPostId);
    
    // Update the post preview to show it's expired
    await post.setCustomPostPreview(() => (
      <vstack height="100%" width="100%" alignment="center middle">
        <text>This poll has expired!</text>
        <text>{question as string}</text>
      </vstack>
    ));
  }
});


// This component will handle the forms and display


// Add the menu item

Devvit.addMenuItem({
  label: 'View Ended Polls',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (event, context) => {
    try {
      await showEndedPollsList(context);
    } catch (error: unknown) {
      if (error instanceof Error) {
        context.ui.showToast({
          text: `Error: ${error.message}`
        });
        console.error("Error in menu action:", error);
      } else {
        context.ui.showToast({
          text: "An unknown error occurred"
        });
        console.error("Unknown error:", error);
      }
    }
  },
});

export async function showEndedPollsList(context: Devvit.Context) {
  try {
    // This function will create and show the list of ended polls
    async function showPollsList() {
      // Get all ended polls
      const endedPolls = await GetEndedPolls(context);
      
      if (endedPolls.length === 0) {
        context.ui.showToast("No ended polls found");
        return;
      }
      
      // Fetch poll data for each ended poll
      const pollsWithData = await Promise.all(
        endedPolls.map(async (poll) => {
          const pollData = await getPollData(context, poll.pollId);
          return {
            pollId: poll.pollId,
            question: pollData.question || "Untitled Poll",
          };
        })
      );
      
      // Create a NEW form each time this function is called
      const endedPollsForm = Devvit.createForm(
        {
          title: "Ended Polls",
          description: "Select a poll to view details",
          fields: [
            {
              type: "select" as const,
              name: "selectedPoll",
              label: "Select a poll",
              options: pollsWithData.map(poll => ({
                label: poll.question || poll.pollId,
                value: poll.pollId
              })),
              multiSelect: false,
              required: true
            }
          ],
          acceptLabel: "View Details"
        },
        async (event, context) => {
          // Handle poll selection...
          const selectedPollId = Array.isArray(event.values.selectedPoll) 
            ? event.values.selectedPoll[0] 
            : event.values.selectedPoll as string;
          
          await showPollDetails(selectedPollId, context);
        }
      );
      
      // Show the form
      context.ui.showForm(endedPollsForm);
    }
    
    // Separate function to show poll details
    async function showPollDetails(pollId: string, context: Devvit.Context) {
      // Get the full poll data for the selected poll
      const pollData = await getPollData(context, pollId);
      
      // Parse the options from the JSON string
      let options: Record<string, string> = {};
      try {
        options = JSON.parse(pollData.options || '{}') as Record<string, string>;
      } catch (error) {
        context.ui.showToast("Error parsing poll options");
        console.error("Error parsing options:", error);
        return;
      }
      
      // Create options array for the form
      const optionsArray = Object.entries(options).map(([key, value]) => ({
        label: value as string,
        value: key
      }));
      
      // Create a NEW details form
      // Create a NEW details form
const pollDetailsForm = Devvit.createForm(
  {
    title: "Poll Details",
    description: pollData.question || "Untitled Poll",
    fields: [
      {
        type: "select" as const,
        name: "selectedOption",
        label: "Select an option",
        options: optionsArray,
        multiSelect: false,
        required: true
      }
    ],
    acceptLabel: "Submit",
    cancelLabel: "Back to List",
    onCancel: async () => {
      // This will be called when the user clicks the Cancel button
      await showPollsList();
    }
  },
  async (detailsEvent, detailsContext) => {
    // This handles the Submit button
    const selectedOption = Array.isArray(detailsEvent.values.selectedOption)
      ? detailsEvent.values.selectedOption[0]
      : detailsEvent.values.selectedOption as string;
      
    const selectedOptionText = options[selectedOption] || "Unknown option";
    
    try {
      // Process the selection (save to Redis or perform other actions)
      detailsContext.ui.showToast(`Selected option: ${selectedOption}`);
      finializePoll(context, pollId, selectedOption);
      // Important: Use setTimeout to ensure the toast is shown before navigating
      //removeFromEndedPost(context, pollId);
      
    } catch (error) {
      console.error("Error saving selection:", error);
      detailsContext.ui.showToast("Error saving selection");
    }
  }
);
      
      // Add a separate handler for the Cancel button
      
      // Show the details form
      context.ui.showForm(pollDetailsForm);
    }
    
    // Initial call to show the list
    await showPollsList();
    
  } catch (error) {
    console.error("Error showing ended polls list:", error);
    throw error;
  }
}




Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Debug Redis Data',
  onPress: async (_, { redis, ui }) => {
    try {
      // Check if the key exists
      const exists = await redis.exists("ended_polls_list");
      console.log(`Key "ended_polls_list" exists: ${exists}`);
      
      // Get the count of items in the sorted set
      const count = await redis.zCard("ended_polls_list");
      console.log(`Number of items in ended_polls_list: ${count}`);
      
      // Get all items in the sorted set
      const items = await redis.zRange("ended_polls_list", 0, -1);
      console.log("Items in ended_polls_list:", items);
      
      ui.showToast("Redis data logged to console");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error checking Redis:", error.message);
        ui.showToast(`Error: ${error.message}`);
      } else {
        console.error("Unknown error:", error);
        ui.showToast("An unknown error occurred");
      }
    }
  }
});
=======

>>>>>>> pinned-post
export default Devvit;
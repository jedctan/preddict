import { Devvit, Context, useForm } from '@devvit/public-api';
import { saveFormData } from './pointsAPI.js';
const PollForm = (context: Context) => {
  const pollForm = useForm(
    {
      fields: [
        {
          name: 'question',
          label: 'Poll Question',
          type: 'string',
          helpText: 'What do you want to ask?',
          required: true,
        },
        {
          name: 'option1',
          label: 'Option 1',
          type: 'string',
          required: true,
        },
        {
          name: 'option2',
          label: 'Option 2',
          type: 'string',
          required: true,
        },
        {
          name: 'option3',
          label: 'Option 3 (Optional)',
          type: 'string',
        },
        {
          name: 'option4',
          label: 'Option 4 (Optional)',
          type: 'string',
        },
      ],
      title: 'Create a Poll',
      acceptLabel: 'Create Poll',
    },
    async (values) => {
        try {
            // Get form values
            const { question, option1, option2, option3, option4 } = values;
            
            // Filter out empty options
            const options = [option1, option2, option3, option4].filter(option => option);

            const postId = `poll_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

            
            // Instead of creating a post, just store the poll data
            await saveFormData(
              context,
              postId, // Use existing post ID
              context.userId || 'Default', // Current user ID or if not signed in Default
              question as string,
              options as string[]
            );
            
            context.ui.showToast('Poll data saved successfully!');
          } catch (error) {
            context.ui.showToast('Failed to save poll: ' + error);
          }
    }
  );

  return (
    <vstack gap="medium" padding="medium">
      <text style="heading">Create a New Poll</text>
      <button 
        appearance="primary"
        onPress={() => {
          context.ui.showForm(pollForm);
        }}
      >
        Open Poll Creation Form
      </button>
    </vstack>
  );
};

export default PollForm;
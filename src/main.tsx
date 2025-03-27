
import { Devvit, useState, useAsync , Context} from '@devvit/public-api';
import DropDownMenu from './dropDownMenu.js';
import { Router } from './Router.js';

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
  render: Router,
});


export default Devvit;
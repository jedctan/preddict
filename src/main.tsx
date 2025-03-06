// Learn more at developers.reddit.com/docs
import { Devvit, useState } from '@devvit/public-api';
import DropDownMenu from './dropDownMenu.js';

Devvit.configure({
  redditAPI: true,
  http: true,
  redis: true,
});

// Add a menu item to the subreddit menu for instantiating the new experience post
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
// Add post type definitions
Devvit.addCustomPostType({
  name: 'Combined Experience Post',
  height: 'regular',
  render: (context) => (
    <vstack>
      <DropDownMenu {...context} />
      {/* Add other components here */}
    </vstack>
  ),
});



export default Devvit;

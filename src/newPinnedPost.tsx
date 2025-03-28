import type { MenuItem } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import { Service } from './Service.js';


export const newPinnedPost: MenuItem = {
  label: 'New pinned post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const service = new Service(context);
    const community = await context.reddit.getCurrentSubreddit();
    const post = await context.reddit.submitPost({
      title: "Pinned Post",
      subredditName: community.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    await post.sticky();
    await service.savePinnedPost(post.id);
    context.ui.navigateTo(post);
  },
};

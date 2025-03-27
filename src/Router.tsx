// Router.tsx : what is rendered for our custom poll post

import type { Context } from '@devvit/public-api';
import { Devvit, useState } from '@devvit/public-api';
import ShowPoll from './showPoll.js';
import { PostId } from './types.js';
import DropdownMenu from './dropDownMenu.js';


export const Router: Devvit.CustomPostComponent = (context: Context) => {
    const postId = context.postId as PostId;


    return (
      <vstack>
        <DropdownMenu {...context} />
        <ShowPoll pollId={postId} onBack={() => null} context={context} />;

      </vstack>
    )

};
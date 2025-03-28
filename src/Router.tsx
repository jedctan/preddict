// Router.tsx : what is rendered for our custom poll post

import type { Context } from '@devvit/public-api';
import { useAsync } from '@devvit/public-api';
import { Devvit, useState } from '@devvit/public-api';
import ShowPoll from './showPoll.js';
import { PostId } from './types.js';
import DropdownMenu from './dropDownMenu.js';
import { getPostType } from './pointsAPI.js';


export const Router: Devvit.CustomPostComponent = (context: Context) => {
    const postId = context.postId;

    if (!postId) {
        return (
            <vstack>
                <text>Error: No post ID found</text>
            </vstack>
        );
    }

    const { data: postType } = useAsync(
        async () => {
            return await getPostType(context, postId);
        }, 
        { depends: [postId] }
    );

    return postType === 'pinned' 

        ? (<vstack alignment='center'>
            <vstack height="40px"></vstack>
            <text size="xxlarge" weight="bold" color="#886CE4">Welcome to r/Preddict 🔮</text>
            <vstack height="10px"></vstack>
            <text wrap={true} size="large" width="450px" weight='bold'>Create a preddict and bet on the future. Argue your side in the comments. Earn points and become the top preddictor.</text>
            <vstack height="10px"></vstack>
            <vstack alignment="center" width="50%">
                <DropdownMenu {...context} />
            </vstack>
        </vstack>)
        : <ShowPoll pollId={postId} onBack={() => null} context={context} />;
};
{/* <hstack width='100%'>
            <hstack width='30%' height="300px" minHeight="150px" alignment="start top">
            </hstack>
            <vstack width='70%' alignment="start">
                <vstack height="100px"></vstack>
                <vstack height="25px"></vstack>
            </vstack>
          </hstack> */}
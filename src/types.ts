export type CommentId = `t1_${string}`;
export type UserId = `t2_${string}`;
export type PostId = `t3_${string}`;
export type SubredditId = `t5_${string}`;

// Pinned post
export type PinnedPostData = {
    postId: PostId;
    postType: string;
  };
  
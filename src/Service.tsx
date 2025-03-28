
import type {
    Post,
    RedditAPIClient,
    RedisClient,
    Scheduler,
    ZRangeOptions,
  } from '@devvit/public-api';

import { PostId, PinnedPostData } from './types.js';

export class Service {

    readonly redis: RedisClient;
    readonly reddit?: RedditAPIClient;
    readonly scheduler?: Scheduler;

    constructor(context: { redis: RedisClient; reddit?: RedditAPIClient; scheduler?: Scheduler }) {
        this.redis = context.redis;
        this.reddit = context.reddit;
        this.scheduler = context.scheduler;
      }

      readonly keys = {
        postData: (postId: PostId) => `poll:${postId}`
      };

    async savePinnedPost(postId: PostId): Promise<void> {
        const key = this.keys.postData(postId);
        await this.redis.hSet(key, {
        postId,
        postType: 'pinned',
        });
    }

    async getPinnedPost(postId: PostId): Promise<PinnedPostData> {
        const key = this.keys.postData(postId);
        const postType = await this.redis.hGet(key, 'postType');
        return {
        postId,
        postType: postType ?? 'pinned',
        };
    }

}
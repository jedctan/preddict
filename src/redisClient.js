// redisClient.js
import { createClient } from 'redis';

const client = createClient({
  url: 'redis://:S4izuaex9rs4s72hdkd5fq475xel4ulczom7k4unvsznpcpectx@redis-14535.c284.us-east1-2.gce.redns.redis-cloud.com:14535'
});

client.on('error', (err) => console.error('Redis Client Error', err));

// Use top-level await to connect if not already connected.
if (!client.isOpen) {
  await client.connect();
}

console.log('Connected to Redis');

export { client };

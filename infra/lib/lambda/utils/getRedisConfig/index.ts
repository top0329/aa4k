/**
 * Redis接続情報
 * @returns Redis接続情報
 */
export const getRedisConfig = () => {
  return {
    host: process.env.REDIS_ENDPOINT,
    port: parseInt(process.env.REDIS_ENDPOINT_PORT || '6379', 10),
  };
}
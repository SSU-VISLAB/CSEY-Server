import { redisClient } from "../../redis/redis_server.ts";

/*** redis get 결과물 parse해서 리턴
 ** get결과물이 없다면 throw error
 * @param key 캐싱 key
 * @returns JSON.parse(get)
 */
export const redisGetAndParse = async (key: string) => {
  const get = await redisClient.get(key);
  if (get) return JSON.parse(get);
  throw new Error(`${key}: 캐싱된 데이터 없음`);
}
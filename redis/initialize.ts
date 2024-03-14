import { initAllOngoingEvents, initAllOngoingNotices } from "./caching.js";
import { connectRedis } from "./connect.js";

export const initializeRedis = async () => {
	await connectRedis();
	await initAllOngoingEvents();
	await initAllOngoingNotices('일반');
	await initAllOngoingNotices('긴급');
}

import { initAllLinktrees, initAllOngoingEvents, initAllOngoingNotices } from "./caching.js";
import { connectRedis } from "./connect.js";

export const initializeRedis = async () => {
	await connectRedis();
	await initAllOngoingEvents();
	await initAllOngoingNotices();
	await initAllLinktrees();
}

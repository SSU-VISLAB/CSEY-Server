import { initAllEvents, initAllLinktrees, initAllOngoingEvents, initAllOngoingNotices } from "./caching.js";
import { connectRedis } from "./connect.js";

export const initializeRedis = async () => {
	await connectRedis();
	await initAllOngoingEvents();
	await initAllEvents();
	await initAllOngoingNotices();
	await initAllLinktrees();
}

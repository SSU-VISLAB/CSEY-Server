import { Alarm, Bookmark, BookmarkAsset, EventsLike, NoticesLike, Read, ReadAsset, User } from "../../models/index.js";
import { redisClient } from "../../redis/connect.js";

const EXPIRE = 3600; // 유효시간 1시간

export const getAlarmInfo = async (userId: string) => {
    const redisKey = `user:alarm:${userId}`;
    const majorRedis = await redisClient.get(redisKey);
    if (majorRedis) {
        return JSON.parse(majorRedis);
    }
    // const user = await User.findByPk(userId);
    // if (!user) {
    //     throw new Error('유저 정보가 없습니다');
    // }
    const userAlarms = await Alarm.findOne({
        where: {
            $fk_user_id$: userId
        }
    });
    await redisClient.set(redisKey, JSON.stringify(userAlarms), { EX: EXPIRE });
    return userAlarms;
}

export async function getMajorInfo(userId: string) {
    const redisKey = `user:major:${userId}`;
    const majorRedis = await redisClient.get(redisKey);

    if (majorRedis) {
        return JSON.parse(majorRedis);
    }

    const user = await User.findByPk(userId);
    if (user) {
        await redisClient.set(redisKey, JSON.stringify(user.major), { EX: EXPIRE });
        return user.major;
    }
    else {
        throw new Error('유저 정보가 없습니다');
    }
}

export async function getEventBookmarkInfo(userId: string) {
    const redisKey = `user:bookmarks:${userId}`;

    const bookmarksRedis = await redisClient.get(redisKey);

    if (bookmarksRedis) {
        return JSON.parse(bookmarksRedis);
    }

    const bookmarks = await Bookmark.findAll({
        where: { fk_user_id: userId },
        include: [{ model: BookmarkAsset, as: 'BookmarkAssets' }]
    });

    if (bookmarks) {
        await redisClient.set(redisKey, JSON.stringify(bookmarks), { EX: EXPIRE });
        return bookmarks;
    } else {
        return [];
    }
}

export async function getEventLikeInfo(userId: string) {
    const key = `user:eventLikes:${userId}`;

    const eventLikesRedis = await redisClient.hGetAll(key);
    const redisKeys = Object.keys(eventLikesRedis);
    if (redisKeys.length) {
        return eventLikesRedis;
    }

    const eventLikes = await EventsLike.findAll({
        where: { fk_user_id: userId },
    });
    if (eventLikes) {
        // redis 캐싱
        eventLikes.forEach(async ({fk_event_id, like}) => {
            like
                ? await redisClient.hSet(`user:eventLikes:${userId}`, fk_event_id, like)
                : await redisClient.hDel(`user:eventLikes:${userId}`, fk_event_id.toString());
        });
        return eventLikes.reduce((acc, {fk_event_id, like}) => {
            acc[fk_event_id] = like;
            return acc;
        }, {});
    } else {
        return [];
    }
}

export async function getNoticeLikeInfo(userId: string) {
    const key = `user:noticeLikes:${userId}`;

    const noticeLikesRedis = await redisClient.get(key);
    if (noticeLikesRedis) {
        return JSON.parse(noticeLikesRedis);
    }

    const noticeLikes = await NoticesLike.findAll({
        where: { fk_user_id: userId }
    });

    if (noticeLikes) {
        await redisClient.set(key, JSON.stringify(noticeLikes), { EX: EXPIRE });
        return noticeLikes;
    } else {
        return [];
    }
}

export async function getNoticeReadInfo(userId: string) {
    const redisKey = `user:noticeReads:${userId}`;

    const noticeReadsRedis = await redisClient.get(redisKey);
    if (noticeReadsRedis) {
        return JSON.parse(noticeReadsRedis);
    }

    const noticeReads = await Read.findAll({
        where: { fk_user_id: userId },
        include: [{ model: ReadAsset, as: 'ReadAssets' }]
    });

    if (noticeReads) {
        await redisClient.set(redisKey, JSON.stringify(noticeReads), { EX: EXPIRE });
        return noticeReads;
    } else {
        return [];
    }
}
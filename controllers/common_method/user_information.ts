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

    const bookmarksRedis = await redisClient.sMembers(redisKey);

    if (bookmarksRedis.length) {
        return bookmarksRedis;
    }

    const bookmarks = await Bookmark.findOne({
        where: { fk_user_id: userId },
        include: [{ model: BookmarkAsset, as: 'BookmarkAssets' }]
    });

    if (bookmarks) {
        const ret = bookmarks.BookmarkAssets.map(ba => ba.fk_event_id.toString());
        await redisClient.sAdd(redisKey, ret);
        return ret;
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
        eventLikes.forEach(async ({ fk_event_id, like }) => {
            like
                ? await redisClient.hSet(`user:eventLikes:${userId}`, fk_event_id, like)
                : await redisClient.hDel(`user:eventLikes:${userId}`, fk_event_id.toString());
        });
        return eventLikes.reduce((acc, { fk_event_id, like }) => {
            acc[fk_event_id] = like;
            return acc;
        }, {});
    } else {
        return [];
    }
}

export async function getNoticeLikeInfo(userId: string) {
    const key = `user:noticeLikes:${userId}`;

    const noticeLikesRedis = await redisClient.hGetAll(key);
    const redisKeys = Object.keys(noticeLikesRedis);
    if (redisKeys.length) {
        return noticeLikesRedis;
    }

    const noticeLikes = await NoticesLike.findAll({
        where: { fk_user_id: userId }
    });
    if (noticeLikes) {
        noticeLikes.forEach(async ({ fk_notice_id, like }) => {
            like
            ? await redisClient.hSet(`user:eventLikes:${userId}`, fk_notice_id, like)
            : await redisClient.hDel(`user:eventLikes:${userId}`, fk_notice_id.toString());
        })
        return noticeLikes.reduce((acc, { fk_notice_id, like }) => {
            acc[fk_notice_id] = like;
            return acc;
        }, {});
    } else {
        return [];
    }
}

export async function getNoticeReadInfo(userId: string) {
    const redisKey = `user:noticeReads:${userId}`;

    const noticeReadsRedis = await redisClient.sMembers(redisKey);
    if (noticeReadsRedis) {
        return noticeReadsRedis;
    }

    const noticeReads = await Read.findOne({
        where: { fk_user_id: userId },
        include: [{ model: ReadAsset, as: 'ReadAssets' }]
    });
    if (!noticeReads) {
        // 없을 경우 잘못된 body
        throw new Error(`잘못된 userId:${userId} 입니다.`)
    }
    const list = noticeReads.ReadAssets.map(ra => ra.fk_notice_id.toString());
    await redisClient.sAdd(`user:noticeReads:${userId}`, list);
    
    return list
}
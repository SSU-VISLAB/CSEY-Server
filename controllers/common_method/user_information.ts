import { User, NoticesLike, EventsLike, Bookmark, BookmarkAsset, Read, ReadAsset } from "../../models/index.ts";
import { redisClient } from "../../redis/redis_server.ts";

const EXPIRE = 3600; // 유효시간 1시간

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
    const redisKey = `user:eventLikes:${userId}`;

    const eventLikesRedis = await redisClient.get(redisKey);
    if (eventLikesRedis) {
        return JSON.parse(eventLikesRedis);
    }

    const eventLikes = await EventsLike.findAll({
        where: { fk_user_id: userId }
    });

    if (eventLikes) {
        await redisClient.set(redisKey, JSON.stringify(eventLikes), { EX: EXPIRE });
        return eventLikes;
    } else {
        return [];
    }
}

export async function getNoticeLikeInfo(userId: string) {
    const redisKey = `user:noticeLikes:${userId}`;

    const noticeLikesRedis = await redisClient.get(redisKey);
    if (noticeLikesRedis) {
        return JSON.parse(noticeLikesRedis);
    }

    const noticeLikes = await NoticesLike.findAll({
        where: { fk_user_id: userId }
    });

    if (noticeLikes) {
        await redisClient.set(redisKey, JSON.stringify(noticeLikes), { EX: EXPIRE });
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
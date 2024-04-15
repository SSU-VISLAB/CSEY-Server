export interface INoticeUserRequest {
    notice_id: number;
    user_id: number;
    like: 'like' | 'dislike' | null
}
export interface INoticeUserRequest {
    notice_id: string;
    user_id: string;
    like: 'like' | 'dislike' | null
}
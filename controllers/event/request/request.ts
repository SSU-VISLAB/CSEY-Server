export interface IEventUserRequest {
    event_id: string;
    user_id: string;
    like: "like" | "dislike" | null;
}
export interface IEventUserRequest {
    event_id: number;
    user_id: number;
    like: "like" | "dislike" | null;
}
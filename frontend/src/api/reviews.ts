import apiClient from "./client";

export interface ReviewData {
    rating: number;
    body: string;
}

export interface Review {
    id: string;
    booking_id: string;
    reviewer_id: string;
    sitter_id: string;
    rating: number;
    body: string;
    created_at: string;
}

export const createReview = async (
    bookingId: string,
    data: ReviewData
    ): Promise<Review> => {
    const resp = await apiClient.post<Review>(
        `/reviews/?booking_id=${bookingId}`,
        data
    );
    return resp.data;
};

export const getSitterReviews = async (sitterId: string): Promise<Review[]> => {
    const resp = await apiClient.get<Review[]>(`/reviews/sitter/${sitterId}`);
    return resp.data;
};
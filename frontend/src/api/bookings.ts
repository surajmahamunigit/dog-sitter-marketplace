import apiClient from "./client";
import type { Booking } from "../types";

export interface CreateBookingData {
    sitter_id: string;
    dog_id: string;
    start_date: string;
    end_date: string;
}

export const createBooking = async (data: CreateBookingData): Promise<Booking> => {
    const response = await apiClient.post<Booking>("/bookings/", data);
    return response.data;
};

export const createCheckoutSession = async (bookingId: string): Promise<string> => {
    const response = await apiClient.post<{ url: string }>(
        "/payments/create-checkout-session",
        { booking_id: bookingId }
    );
    return response.data.url;
};
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
    const response = await apiClient.post<{ checkout_url: string }>(
        "/payments/create-checkout-session",
        { booking_id: bookingId }
    );
    return response.data.checkout_url;
};

export async function getMyBookings(): Promise<Booking[]> {
    const response = await apiClient.get<Booking[]>("/bookings/");
    return response.data;
}

export async function updateBookingStatus(
    bookingId: string,
    status: string
): Promise<Booking> {
    const response = await apiClient.patch<Booking>(
        `/bookings/${bookingId}/status`,
        { status }
    );
    return response.data;
}


export const deleteBooking = async (bookingId: string): Promise<void> => {
    await apiClient.delete(`/bookings/${bookingId}`);
};
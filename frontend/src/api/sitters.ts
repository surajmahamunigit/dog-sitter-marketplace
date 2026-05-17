import apiClient from "./client";
import type { Sitter } from "../types";

interface LocationParams {
    lat: number;
    lng: number;
    radius?: number;
}

export const getSitters = async (location?: LocationParams): Promise<Sitter[]> => {
    const params = location
        ? { lat: location.lat, lng: location.lng, radius: location.radius ?? 25 }
        : {};
    const response = await apiClient.get<Sitter[]>("/sitters/", { params });
    return response.data;
};

export const getSitterById = async (id: string): Promise<Sitter> => {
    const response = await apiClient.get<Sitter>(`/sitters/${id}`);
    return response.data;
};
import apiClient from "./client";
import type { Sitter } from "../types";

export const getSitters = async (): Promise<Sitter[]> => {
    const response = await apiClient.get<Sitter[]>("/sitters/");
    return response.data;
};

export const getSitterById = async (id: string): Promise<Sitter> => {
    const response = await apiClient.get<Sitter>(`/sitters/${id}`);
    return response.data;
};
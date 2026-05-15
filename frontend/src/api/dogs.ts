import apiClient from "./client";
import type { Dog } from "../types";

export const getMyDogs = async (): Promise<Dog[]> => {
    const response = await apiClient.get<Dog[]>("/dogs/");
    return response.data;
};

export const deleteDog = async (id: string): Promise<void> => {
    await apiClient.delete(`/dogs/${id}`);
};
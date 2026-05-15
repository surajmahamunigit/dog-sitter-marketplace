import apiClient from "./client";
import type { Dog } from "../types";

export const getMyDogs = async (): Promise<Dog[]> => {
    const response = await apiClient.get<Dog[]>("/dogs/");
    return response.data;
};

export const deleteDog = async (id: string): Promise<void> => {
    await apiClient.delete(`/dogs/${id}`);
};

export interface CreateDogData {
    name: string;
    breed: string;
    age: number;
    weight: number;
}

export const createDog = async (data: CreateDogData): Promise<Dog> => {
    const response = await apiClient.post<Dog>("/dogs/", data);
    return response.data;
};
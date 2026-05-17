import apiClient from "./client";
import type { Dog } from "../types";

export const getMyDogs = async (): Promise<Dog[]> => {
    const response = await apiClient.get<Dog[]>("/dogs/");
    return response.data;
};

export const getDogById = async (id: string): Promise<Dog> => {
    const response = await apiClient.get<Dog>(`/dogs/${id}`)
    return response.data
}

export const deleteDog = async (id: string): Promise<void> => {
    await apiClient.delete(`/dogs/${id}`);
};

export interface CreateDogData {
    name: string;
    breed: string;
    age: number;
    weight: number;
}

export interface UpdateDogData {
    dog_profile?: {
        size?: string
        energy_level?: string
        temperament?: string[]
        good_with_other_dogs?: boolean
        good_with_cats?: boolean
        good_with_children?: boolean
        house_trained?: boolean
        special_needs?: string[]
        medical_notes?: string
        vaccination_status?: string
    }
}


export const createDog = async (data: CreateDogData): Promise<Dog> => {
    const response = await apiClient.post<Dog>("/dogs/", data);
    return response.data;
};


export async function updateDog(id: string, data: UpdateDogData): Promise<Dog> {
    const response = await apiClient.patch<Dog>(`/dogs/${id}`, data)
    return response.data
}
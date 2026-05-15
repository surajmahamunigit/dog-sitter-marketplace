// src/api/sitters.ts
import client from "./client";

export type Sitter = {
    id: string;
    name: string;
    bio: string;
    profile_photo_url: string | null;
    sitter_profile: {
        services: string[];
        rate_per_night: number;
    } | null;
}

export async function getSitters(): Promise<Sitter[]> {
    const response = await client.get("/sitters/");
    return response.data;
}

export async function getSitterById(id: string): Promise<Sitter> {
    const response = await client.get(`/sitters/${id}`);
    return response.data;
}
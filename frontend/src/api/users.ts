import apiClient from "./client"
import type { User } from "../types"

export interface UpdateMeData {
    name?: string
    email?: string
    bio?: string
    location?: {
        city?: string
        state?: string
        lat?: number
        lng?: number
    }
    sitter_profile?: {
        services?: string[]
        nightly_rate?: number
        experience_years?: number
        accepted_dog_sizes?: string[]
        accepts_puppies?: boolean
        accepts_senior_dogs?: boolean
        accepts_special_needs?: boolean
        has_yard?: boolean
        has_other_pets?: boolean
        smoke_free_home?: boolean
    }
}

export async function updateMe(data: UpdateMeData): Promise<User> {
    const response = await apiClient.patch<User>("/users/me", data)
    return response.data
}
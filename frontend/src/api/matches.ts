import apiClient from './client'
import type { MatchResponse } from '../types'

export async function findMatches(dogId: string): Promise<MatchResponse> {
    const response = await apiClient.post<MatchResponse>('/matches/find', {
        dog_id: dogId,
        radius_miles: 25,
    })
    return response.data
}
import apiClient from "./client"

export async function getCareInstructions(dogId: string): Promise<{
    content: string
    embedding_status: string
} | null> {
    try {
        const response = await apiClient.get(`/care-instructions/${dogId}`)
        return response.data
    } catch (err: any) {
        // 404 means no instructions yet — that's fine, not an error
        if (err.response?.status === 404) return null
        throw err
    }
}

export async function saveCareInstructions(
    dogId: string,
    content: string
): Promise<void> {
    await apiClient.post(`/care-instructions/${dogId}`, { content })
}
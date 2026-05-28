import apiClient from "./client"

export async function askRag(
    dog_id: string,
    question: string
): Promise<{ answer: string }> {
    const response = await apiClient.post<{ answer: string }>("/rag/ask", {
        dog_id,
        question,
    })
    return response.data
}
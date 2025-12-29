import { api } from "../../lib/axios.config";
import { ICard } from "../../types/card";

export const getCards = async (): Promise<ICard[]> => {
    const response = await api.get("/cards");
    return response.data;
};

export const getCardById = async (id: string): Promise<ICard> => {
    const response = await api.get(`/cards/${id}`);
    return response.data;
};

export const updateCard = async (id: string, data: Partial<ICard>): Promise<ICard> => {
    const response = await api.put(`/cards/${id}`, data);
    return response.data;
};

export const deleteCard = async (id: string): Promise<void> => {
    await api.delete(`/cards/${id}`);
};

export const createCard = async (data: Omit<ICard, '_id' | 'createdAt' | 'updatedAt'>): Promise<ICard> => {
    const response = await api.post("/cards", data);
    return response.data;
};

export const bulkCreateCards = async (cards: Omit<ICard, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<{ message: string; cards: ICard[] }> => {
    const response = await api.post("/cards/bulk", { cards });
    return response.data;
};

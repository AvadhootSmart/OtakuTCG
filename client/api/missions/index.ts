import { api } from "../../lib/axios.config";
import { IMission } from "../../types/mission";

export const getMissions = async (): Promise<IMission[]> => {
    const response = await api.get("/missions");
    return response.data;
};

export const getMissionById = async (id: string): Promise<IMission> => {
    const response = await api.get(`/missions/${id}`);
    return response.data;
};

export const createMission = async (data: Omit<IMission, '_id' | 'createdAt' | 'updatedAt'>): Promise<IMission> => {
    const response = await api.post("/missions", data);
    return response.data;
};

export const updateMission = async (id: string, data: Partial<IMission>): Promise<IMission> => {
    const response = await api.put(`/missions/${id}`, data);
    return response.data;
};

export const deleteMission = async (id: string): Promise<void> => {
    await api.delete(`/missions/${id}`);
};

export const completeMission = async (id: string, submitted_cards: string[]): Promise<any> => {
    const response = await api.post(`/missions/${id}/complete`, { submitted_cards });
    return response.data;
};

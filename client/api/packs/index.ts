import { api } from "@/lib/axios.config";
import { IPack } from "@/types/pack";

export const getPacks = async (): Promise<IPack[]> => {
    const response = await api.get("/packs");
    return response.data;
};

export const getPack = async (id: string): Promise<IPack> => {
    const response = await api.get(`/packs/${id}`);
    return response.data;
};

export const createPack = async (packData: Partial<IPack>): Promise<IPack> => {
    const response = await api.post("/packs", packData);
    return response.data;
};

export const updatePack = async (id: string, packData: Partial<IPack>): Promise<IPack> => {
    const response = await api.put(`/packs/${id}`, packData);
    return response.data;
};

export const deletePack = async (id: string): Promise<void> => {
    await api.delete(`/packs/${id}`);
};

export const recalculateProbabilities = async (): Promise<{ message: string; updatedCount: number }> => {
    const response = await api.post("/packs/recalculate-probabilities");
    return response.data;
};

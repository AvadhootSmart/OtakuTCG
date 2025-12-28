import { api } from "../../lib/axios.config";
import { IPack } from "../../types/pack";

export const getPacks = async (): Promise<IPack[]> => {
    const response = await api.get("/packs");
    return response.data;
};

export const getPackById = async (id: string): Promise<IPack> => {
    const response = await api.get(`/packs/${id}`);
    return response.data;
};

export const buyPack = async (id: string): Promise<{ message: string, balance: number }> => {
    const response = await api.post(`/packs/buy/${id}`);
    return response.data;
};

import { create } from 'zustand';
import { IUserProfile, getProfile } from '@/api/user';

interface UserState {
    profile: IUserProfile | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setProfile: (profile: IUserProfile | null) => void;
    updateBalance: (newBalance: number) => void;
    fetchProfile: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
    profile: null,
    isLoading: false,
    error: null,

    setProfile: (profile) => set({ profile }),

    updateBalance: (newBalance) => set((state) => ({
        profile: state.profile ? { ...state.profile, balance: newBalance } : null
    })),

    fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
            const profile = await getProfile();
            set({ profile, isLoading: false });
        } catch (err: any) {
            set({
                error: err.response?.data?.error || 'Failed to fetch profile',
                isLoading: false
            });
        }
    }
}));

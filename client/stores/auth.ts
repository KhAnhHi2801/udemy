import { create } from "zustand";

interface User {
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

const useUser = () => useAuthStore((state) => state.user);
const useSetUser = () => useAuthStore((state) => state.setUser);
const useLogout = () => useAuthStore((state) => state.logout);

export { useUser, useSetUser, useLogout };
export type { User, AuthState };

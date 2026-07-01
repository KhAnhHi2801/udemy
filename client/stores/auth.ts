import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  /**
   * Wrap the store with the persist middleware to enable state persistence across sessions.
   * The 'name' option specifies the key under which the state will be stored in localStorage.
   * This allows the user's authentication state to be retained even after a page refresh or browser restart.
   */
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: "auth-storage-udemy" }, // The key used to store the state in localStorage
  ),
);

const useUser = () => useAuthStore((state) => state.user);
const useSetUser = () => useAuthStore((state) => state.setUser);
const useLogout = () => useAuthStore((state) => state.logout);

export { useUser, useSetUser, useLogout };
export type { User, AuthState };

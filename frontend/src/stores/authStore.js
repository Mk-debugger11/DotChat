// Auth store using Zustand
// Manages user authentication state

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Create auth store with persistence (saves to localStorage)
export const useAuthStore = create(
  persist(
    (set) => ({
      // State
      user: null, // Current logged-in user
      token: null, // JWT token

      // Actions
      // Login - save user and token
      login: (user, token) => {
        set({ user, token });
      },

      // Logout - clear user and token
      logout: () => {
        set({ user: null, token: null });
      }
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);


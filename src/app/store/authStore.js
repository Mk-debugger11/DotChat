import { create } from "zustand";

function getAccessToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}
export const useAuthStore = create((set) => ({
  token: getAccessToken(),
  isAuthenticated: !!getAccessToken(),

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token: token, isAuthenticated: true });
  },
  clearToken: () => {
    localStorage.removeItem("token"),
      set({ token: "", isAuthenticated: false });
  },
}));

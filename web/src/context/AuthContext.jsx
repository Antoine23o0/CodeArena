import { createContext, useState, useEffect } from "react";
import api from "../api";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

const persistSession = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch {
      clearSession();
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.post("/users/login", { username, password });
    const { token, user: userData } = res.data;
    if (!token || !userData) {
      throw new Error("Réponse de connexion invalide");
    }
    persistSession(token, userData);
    setUser(userData);
    return userData;
  };

  const register = async (username, password) => {
    const res = await api.post("/users/register", { username, password });
    const { token, user: userData } = res.data;
    if (!token || !userData) {
      throw new Error("Réponse d'inscription invalide");
    }
    persistSession(token, userData);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

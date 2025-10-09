import { createContext, useState, useEffect } from "react";
import api from "../api/api.js";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  //Quand la page se recharge, on récupère l’utilisateur stocké
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   const storedUser = localStorage.getItem("user");
  //   if (token && storedUser) {
  //     setUser(JSON.parse(storedUser));
  //   }
  // }, []);
  
  //Connexion
  const login = async (username, password) => {
    const res = await api.post("/login", { username, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  //Inscription
  const register = async (username, password) => {
    const res = await api.post("/register", { username, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  //Déconnexion
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
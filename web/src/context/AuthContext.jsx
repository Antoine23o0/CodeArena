import { createContext, useState, useEffect } from "react";
import api from "../api/api.js";

// Le contexte doit rester dans ce fichier pour partager la logique avec le provider,
// on désactive donc la règle Fast Refresh qui impose d'exporter uniquement des composants.
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

<<<<<<< HEAD
  //Quand la page se recharge, on récupère l’utilisateur stocké
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   const storedUser = localStorage.getItem("user");
  //   if (token && storedUser) {
  //     setUser(JSON.parse(storedUser));
  //   }
  // }, []);
  
  //Connexion
=======
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch {
      clearSession();
    }
  }, []);

>>>>>>> origin/codex/review-project-and-provide-feedback-kmcakh
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
<<<<<<< HEAD
export default AuthContext;
=======
>>>>>>> origin/codex/review-project-and-provide-feedback-kmcakh

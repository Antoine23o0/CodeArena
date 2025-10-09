import { createContext, useState, useEffect } from "react";
import api from "../api";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  //Quand la page se recharge, on récupère l’utilisateur stocké
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  //Connexion
  const login = async (userName, password) => {
    const res = await api.post("/login", { userName, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  //Inscription
  const register = async (userName, password) => {
    const res = await api.post("/register", { userName, password });
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


// import { createContext, useState, useEffect } from "react";
// import api from "../api";

// // eslint-disable-next-line react-refresh/only-export-components
// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   // Charger l'utilisateur depuis le localStorage
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const storedUser = localStorage.getItem("user");
//     if (token && storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   // Connexion simulée (mock)
//   const login = async (username, password) => {
//     if (username === "demo" && password === "1234") {
//       const fakeUser = { username: "demo", role: "tester" };
//       const fakeToken = "fake-jwt-token";
//       localStorage.setItem("token", fakeToken);
//       localStorage.setItem("user", JSON.stringify(fakeUser));
//       setUser(fakeUser);
//       return;
//     }

//     throw new Error("Identifiants invalides");
//   };

//   // Inscription simulée
//   const register = async (username, password) => {
//     const res = await api.post("/register", { username, password });
//     localStorage.setItem("token", res.data.token);
//     localStorage.setItem("user", JSON.stringify(res.data.user));
//     setUser(res.data.user);
//   };  

//   // Déconnexion
//   const logout = () => {
//     localStorage.clear();
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, register, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };



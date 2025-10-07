import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate("/"); // redirige vers la page principale
    } catch {
      alert("Erreur : identifiants invalides.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Connexion</h2>
        <input
          className="w-full p-2 mb-3 border rounded"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full p-2 mb-3 border rounded"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Se connecter
        </button>
        <p className="text-sm mt-3 text-center">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-blue-600">
            S’inscrire
          </Link>
        </p>
      </form>
    </div>
  );
}

import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

    try {
      await register(username, password);
      navigate("/login");
    } catch {
      alert("Erreur lors de l’inscription. Vérifie tes informations.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[90%] max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Créer un compte</h1>
        <p className="text-center text-gray-500 mb-6">
          Rejoins CodeArena et commence à coder en compétition
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm mb-1">Nom d’utilisateur</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="ex: goku_dev"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">Mot de passe</label>
            <input
              type="password"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">Confirme le mot de passe</label>
            <input
              type="password"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200"
          >
            S’inscrire
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-5">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}


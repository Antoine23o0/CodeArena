import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center shadow-md">
      {/* Logo / Titre */}
      <Link to="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition">
        CodeArena
      </Link>

      {/* Liens */}
      <div className="flex items-center space-x-6">
        {user ? (
          <>
            <Link to="/" className="hover:text-blue-400 transition">
              Concours
            </Link>
            <Link to="/scoreboard/global" className="hover:text-blue-400 transition">
              Scoreboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-400 transition">
              Connexion
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              S’inscrire
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

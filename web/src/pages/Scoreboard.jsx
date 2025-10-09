import { useEffect, useState } from "react";
import api from "../api/api";

export default function Scoreboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get("/leaderboard");
        setPlayers(res.data);
      } catch (err) {
        console.error("Erreur de chargement du classement :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <p className="text-center text-white mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Classement général</h1>

      <div className="bg-gray-800 rounded-lg p-4 shadow-md max-w-2xl mx-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400">
              <th>#</th>
              <th>Nom</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <tr key={p._id || i} className="border-t border-gray-700">
                <td>{i + 1}</td>
                <td>{p.username}</td>
                <td>{p.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


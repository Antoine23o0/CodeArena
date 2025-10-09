import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

export default function Contest() {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const res = await api.get(`/problems/${id}`);
        setContest(res.data);
      } catch (err) {
        console.error("Erreur de chargement du défi :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, [id]);

  if (loading) return <p className="text-center text-white mt-10">Chargement...</p>;
  if (!contest) return <p className="text-center text-red-400 mt-10">Défi introuvable</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">{contest.title}</h1>
      <p className="text-gray-300 mb-6">{contest.description}</p>
      <p className="text-gray-400 mb-4">
        Difficulté :{" "}
        <span className="font-semibold text-blue-400">{contest.difficulty}</span>
      </p>

      <Link
        to={`/submit?problemId=${contest._id}`}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Soumettre une solution →
      </Link>
    </div>
  );
}

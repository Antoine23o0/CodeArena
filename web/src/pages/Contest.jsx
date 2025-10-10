import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { useScoreboard } from "../hooks/useScoreboard";

const statusBadgeClass = {
  running: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
  scheduled: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
  finished: "bg-slate-500/20 text-slate-300 border border-slate-500/40",
};

const formatDate = (date) =>
  new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));

export default function Contest() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const { scoreboard } = useScoreboard(id);

  useEffect(() => {
    api
      .get(`/contests/${id}`)
      .then((res) => setContest(res.data))
      .catch(() => setContest(null));
    api
      .get(`/problems/contest/${id}`)
      .then((res) => setProblems(res.data))
      .catch(() => setProblems([]));
  }, [id]);

  const handleJoin = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      setJoining(true);
      setError("");
      await api.post(`/contests/${id}/join`);
      const updated = await api.get(`/contests/${id}`);
      setContest(updated.data);
    } catch (err) {
      setError(err.response?.data?.error ?? "Impossible de rejoindre ce concours");
    } finally {
      setJoining(false);
    }
  };

  const userJoined = useMemo(() => {
    if (!contest || !user) return false;
    return contest.participants?.some((participant) => {
      if (!participant) return false;
      const participantId =
        typeof participant === "string"
          ? participant
          : participant._id
          ? participant._id.toString()
          : participant.toString();
      return participantId === user._id;
    });
  }, [contest, user]);

  if (!contest) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950 text-white">
        <p>Chargement du concours...</p>
      </div>
    );
  }

  const badgeClass = statusBadgeClass[contest.status] ?? statusBadgeClass.scheduled;

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">{contest.title}</h1>
              <p className="text-slate-300 max-w-2xl">{contest.description}</p>
              <div className="mt-3 text-sm text-slate-400 space-y-1">
                <p>
                  Début : <span className="text-slate-200">{formatDate(contest.startDate)}</span>
                </p>
                <p>
                  Fin : <span className="text-slate-200">{formatDate(contest.endDate)}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className={`px-3 py-1 text-xs font-semibold uppercase rounded-full ${badgeClass}`}>
                {contest.status === "running"
                  ? "En cours"
                  : contest.status === "finished"
                  ? "Terminé"
                  : "À venir"}
              </span>
              <button
                onClick={handleJoin}
                disabled={joining || userJoined}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {userJoined ? "Vous participez déjà" : joining ? "Inscription..." : "Rejoindre le concours"}
              </button>
              <Link
                to={`/scoreboard/${id}`}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Voir le classement →
              </Link>
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
          </div>
        </div>

        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Énoncés</h2>
            <span className="text-sm text-slate-400">{problems.length} problèmes</span>
          </div>
          {problems.length === 0 ? (
            <p className="text-slate-400">Les problèmes ne sont pas encore disponibles.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {problems.map((problem) => (
                <div
                  key={problem._id}
                  className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white">{problem.title}</h3>
                    <p className="text-sm text-slate-400 capitalize">Difficulté : {problem.difficulty}</p>
                    <p className="text-sm text-slate-400">Score max : {problem.maxScore}</p>
                  </div>
                  <Link
                    to={`/contest/${id}/problem/${problem._id}`}
                    className="mt-4 text-sm text-blue-400 hover:text-blue-300"
                  >
                    Ouvrir l'éditeur →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Top 5 en direct</h2>
            <Link to={`/scoreboard/${id}`} className="text-sm text-blue-400 hover:text-blue-300">
              Classement complet →
            </Link>
          </div>
          {scoreboard.length === 0 ? (
            <p className="text-slate-400 text-sm">Aucune soumission validée pour l'instant.</p>
          ) : (
            <ul className="divide-y divide-slate-800">
              {scoreboard.slice(0, 5).map((row) => (
                <li key={row.user} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-400">#{row.rank}</span>
                    <span className="text-white font-medium">{row.userName}</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">{row.totalScore} pts</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}


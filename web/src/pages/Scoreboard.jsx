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

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import { useScoreboard } from "../hooks/useScoreboard";

const formatDate = (date) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
};

export default function Scoreboard() {
  const { contestId } = useParams();
  const effectiveContestId = contestId === "global" ? null : contestId;
  const { scoreboard, loading } = useScoreboard(effectiveContestId ?? undefined);
  const [contest, setContest] = useState(null);

  useEffect(() => {
    if (!effectiveContestId) {
      setContest(null);
      return;
    }

    api
      .get(`/contests/${effectiveContestId}`)
      .then((res) => setContest(res.data))
      .catch(() => setContest(null));
  }, [effectiveContestId]);

  const title = effectiveContestId
    ? contest?.title ?? "Scoreboard du concours"
    : "Classement global";

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {contest && (
              <p className="text-sm text-slate-400">
                Du {new Date(contest.startDate).toLocaleString()} au {" "}
                {new Date(contest.endDate).toLocaleString()}
              </p>
            )}
          </div>
          <Link
            to="/"
            className="text-sm text-blue-400 hover:text-blue-300 transition"
          >
            ← Retour aux concours
          </Link>
        </div>

        {loading ? (
          <div className="bg-slate-900 rounded-lg p-6 text-center">Chargement...</div>
        ) : scoreboard.length === 0 ? (
          <div className="bg-slate-900 rounded-lg p-6 text-center text-slate-300">
            Aucun résultat pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 bg-slate-900 rounded-lg">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Rang
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Participant
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                    Score
                  </th>
                  {effectiveContestId && (
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                      Problèmes résolus
                    </th>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                    Dernière soumission
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {scoreboard.map((row) => (
                  <tr key={row.user} className="hover:bg-slate-800 transition">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-200">
                      #{row.rank}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-medium text-white">{row.userName}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-400">
                      {row.totalScore}
                    </td>
                    {effectiveContestId && (
                      <td className="px-4 py-3 text-sm text-right text-slate-300">
                        {row.solved ?? 0}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-right text-slate-400">
                      {row.lastSubmissionAt ? formatDate(row.lastSubmissionAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


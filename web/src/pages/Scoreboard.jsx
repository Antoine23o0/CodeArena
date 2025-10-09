
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


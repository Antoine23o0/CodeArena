<<<<<<< HEAD
import React, { useEffect, useRef, useState } from "react";
import api from "../api/api.js";
=======
import { useEffect, useState } from "react";
>>>>>>> origin/codex/review-project-and-provide-feedback-kmcakh
import { Link } from "react-router-dom";
import api from "../api";

const badgeClass = {
  running: "bg-emerald-500/20 text-emerald-600",
  scheduled: "bg-amber-500/20 text-amber-600",
  finished: "bg-slate-500/20 text-slate-600",
};

const formatDate = (date) => new Date(date).toLocaleString();

export default function ContestList() {
  const [contests, setContests] = useState([]);
  const didFetch = useRef(false);

  useEffect(() => {
<<<<<<< HEAD
    if (didFetch.current) return;
    didFetch.current = true;

    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        //const res = await api.get("/contests", { signal: controller.signal });
        // if (!cancelled) setContests(res.data || []);
      } catch (err) {
        if (!/abort/i.test(err.name)) console.error("fetch contests error", err);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
        Concours disponibles
      </h1>
      <div className="max-w-xl mx-auto">
        {contests.map((c) => (
          <div
            key={c._id}
            className="p-4 mb-3 bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold">{c.title}</h2>
            <p className="text-sm text-gray-500">{c.description}</p>
            <Link
              to={`/contest/${c._id}`}
              className="text-blue-600 hover:underline text-sm mt-2 inline-block"
            >
              Voir le concours →
            </Link>
=======
    api
      .get("/contests")
      .then((res) => {
        setContests(
          [...res.data].sort((a, b) => {
            const orderA = a.difficultyOrder ?? Number.MAX_SAFE_INTEGER;
            const orderB = b.difficultyOrder ?? Number.MAX_SAFE_INTEGER;
            if (orderA !== orderB) return orderA - orderB;
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          }),
        );
      })
      .catch(() => setContests([]));
  }, []);

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Concours en temps réel</h1>
        {contests.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center text-slate-300">
            Aucun concours disponible pour le moment. Revenez bientôt !
>>>>>>> origin/codex/review-project-and-provide-feedback-kmcakh
          </div>
        ) : (
          <div className="grid gap-6">
            {contests.map((contest) => (
              <div
                key={contest._id}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg hover:border-blue-500/60 transition"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold mb-1">{contest.title}</h2>
                    <p className="text-slate-300 mb-3">{contest.description}</p>
                    <p className="text-sm text-slate-400 mb-3">
                      Niveau {contest.difficultyOrder ?? "?"}
                      {contest.difficulty ? ` · ${contest.difficulty}` : ""}
                    </p>
                    <div className="text-sm text-slate-400 space-y-1">
                      <p>Début : {formatDate(contest.startDate)}</p>
                      <p>Fin : {formatDate(contest.endDate)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-3 py-1 text-xs font-semibold uppercase rounded-full ${badgeClass[contest.status] ?? badgeClass.scheduled}`}>
                      {contest.status === "running"
                        ? "En cours"
                        : contest.status === "finished"
                        ? "Terminé"
                        : "À venir"}
                    </span>
                    {contest.status === "finished" ? (
                      <Link
                        to={`/scoreboard/${contest._id}`}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium"
                      >
                        Voir le classement →
                      </Link>
                    ) : (
                      <Link
                        to={`/contest/${contest._id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium"
                      >
                        {contest.status === "scheduled" ? "Voir les détails" : "Rejoindre →"}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
};

const statusColors = {
  Accepted: "text-emerald-400",
  "Wrong Answer": "text-amber-400",
  "Runtime Error": "text-rose-400",
  Pending: "text-slate-300",
};

export default function Profile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    let active = true;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/users/profile");
        if (active) {
          setProfile(data);
          setError(null);
        }
      } catch (err) {
        if (!active) return;
        const message = err.response?.data?.error ?? "Impossible de charger le profil.";
        setError(message);
        setProfile(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, [user, navigate]);

  const languageSummary = useMemo(() => {
    if (!profile?.stats?.languages?.length) {
      return "—";
    }
    return profile.stats.languages
      .map((entry) => `${entry.language.toUpperCase()} (${entry.count})`)
      .join(", ");
  }, [profile]);

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Profil</h1>
            {profile?.user?.userName && (
              <p className="text-slate-400">@{profile.user.userName}</p>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg">
              Rang global : <span className="font-semibold text-white">#{profile?.rank ?? "—"}</span>
            </span>
            <Link
              to="/scoreboard/global"
              className="bg-blue-600 hover:bg-blue-700 transition px-3 py-2 rounded-lg text-white font-medium"
            >
              Voir le classement
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="bg-slate-900 rounded-lg p-6 text-center text-slate-300">
            Chargement du profil...
          </div>
        ) : error ? (
          <div className="bg-rose-900/40 border border-rose-700 rounded-lg p-6 text-center text-rose-200">
            {error}
          </div>
        ) : profile ? (
          <>
            <section className="grid md:grid-cols-2 gap-4">
              <article className="bg-slate-900 rounded-lg p-6 border border-slate-800 space-y-3">
                <h2 className="text-lg font-semibold text-white">Informations</h2>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>Membre depuis</span>
                    <span className="text-white">
                      {formatDate(profile.user?.createdAt ?? profile.user?.signInDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Score total</span>
                    <span className="text-emerald-400 font-semibold">{profile.user?.totalScore ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Concours participés</span>
                    <span className="text-white">{profile.stats?.contestsParticipated ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Langage favori</span>
                    <span className="text-white">
                      {profile.stats?.favoriteLanguage?.toUpperCase() ?? "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 mb-1">Répartition des langages</span>
                    <p className="text-white text-sm">{languageSummary}</p>
                  </div>
                </div>
              </article>

              <article className="bg-slate-900 rounded-lg p-6 border border-slate-800 space-y-3">
                <h2 className="text-lg font-semibold text-white">Performances</h2>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>Total des soumissions</span>
                    <span className="text-white">{profile.stats?.totalSubmissions ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Soumissions acceptées</span>
                    <span className="text-emerald-400 font-semibold">
                      {profile.stats?.acceptedSubmissions ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taux de réussite</span>
                    <span className="text-white">
                      {profile.stats?.acceptanceRate != null
                        ? `${profile.stats.acceptanceRate}%`
                        : "0%"}
                    </span>
                  </div>
                </div>
              </article>
            </section>

            <section className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Dernières soumissions</h2>
                <Link to="/" className="text-sm text-blue-400 hover:text-blue-300 transition">
                  Explorer les concours
                </Link>
              </div>
              {profile.recentSubmissions?.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                        <th className="px-4 py-3">Problème</th>
                        <th className="px-4 py-3">Concours</th>
                        <th className="px-4 py-3">Langage</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3 text-right">Score</th>
                        <th className="px-4 py-3 text-right">Soumis le</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm">
                      {profile.recentSubmissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-slate-800/60 transition">
                          <td className="px-4 py-3 text-white">
                            {submission.problem && submission.contest ? (
                              <Link
                                to={`/contest/${submission.contest.id}/problem/${submission.problem.id}`}
                                className="hover:text-blue-400"
                              >
                                {submission.problem.title}
                              </Link>
                            ) : submission.problem ? (
                              submission.problem.title
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            {submission.contest ? submission.contest.title : "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            {submission.language?.toUpperCase() ?? "—"}
                          </td>
                          <td className={`px-4 py-3 font-semibold ${statusColors[submission.status] ?? "text-slate-300"}`}>
                            {submission.status ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-400 font-semibold">
                            {submission.score ?? 0}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-400">
                            {formatDateTime(submission.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-300 text-sm">Aucune soumission pour le moment.</p>
              )}
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

import { useState } from "react";
import api from "../api/api";
import { useSearchParams } from "react-router-dom";

export default function Submit() {
  const [searchParams] = useSearchParams();
  const problemId = searchParams.get("problemId");

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setResult("");
    try {
      const res = await api.post("/submit", { code, problemId, language });
      setResult(res.data.output || "Aucune sortie détectée");
    } catch {
      setResult("Erreur pendant l'exécution");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Soumettre une solution</h1>

      <div className="flex flex-col gap-4 mb-4">
        <select
          className="bg-gray-800 p-2 rounded w-40"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>

        <textarea
          className="w-full h-64 p-4 bg-gray-800 rounded resize-none"
          placeholder="Écris ton code ici..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        ></textarea>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        {loading ? "Exécution..." : "Exécuter le code"}
      </button>

      <div className="mt-6 bg-gray-800 p-4 rounded">
        <h2 className="font-semibold mb-2">Résultat :</h2>
        <pre className="text-sm whitespace-pre-wrap">{result}</pre>
      </div>
    </div>
  );
}

import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

const templates = {
  python: `def solve():
    data = input().strip()
    print(data)

if __name__ == "__main__":
    solve()
`,
  java: `import java.io.BufferedReader;
import java.io.InputStreamReader;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String line = reader.readLine();
        if (line == null) {
            return;
        }
        System.out.println(line.trim());
    }
}
`,
  c: `#include <stdio.h>
#include <string.h>

int main(void) {
    char buffer[1024];
    if (fgets(buffer, sizeof(buffer), stdin)) {
        buffer[strcspn(buffer, "\n")] = '\0';
        printf("%s", buffer);
    }
    return 0;
}
`,
};

const statusColors = {
  Accepted: "text-emerald-400",
  "Wrong Answer": "text-amber-400",
  "Runtime Error": "text-red-400",
  "Compilation Error": "text-red-400",
  "Time Limit Exceeded": "text-amber-400",
};

const FALLBACK_LANGUAGES = ["python", "java", "c"];

const LANGUAGE_LABELS = {
  python: "Python 3",
  java: "Java 17",
  c: "GCC (C11)",
};

export default function Submit() {
  const { id: contestId, problemId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [allowedLanguages, setAllowedLanguages] = useState([...FALLBACK_LANGUAGES]);
  const [language, setLanguage] = useState("python");
  const [sourceCode, setSourceCode] = useState(templates.python);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const publicTestCases = useMemo(
    () => (problem?.testCases || []).filter((test) => !test.hidden),
    [problem],
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    api
      .get(`/problems/${problemId}`)
      .then((res) => {
        setProblem(res.data);
        const fromServer =
          Array.isArray(res.data.allowedLanguages) && res.data.allowedLanguages.length > 0
            ? res.data.allowedLanguages
            : FALLBACK_LANGUAGES;
        const normalized = fromServer.map((lang) => `${lang}`.toLowerCase());
        setAllowedLanguages(normalized);
        setLanguage((prev) => (normalized.includes(prev) ? prev : normalized[0] ?? "python"));
      })
      .catch(() => setProblem(null));
    api
      .get(`/submissions/contest/${contestId}`)
      .then((res) => setHistory(res.data))
      .catch(() => setHistory([]));
  }, [contestId, problemId, user, navigate]);

  useEffect(() => {
    setSourceCode(templates[language] ?? "");
  }, [language]);

  const submitCode = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const payload = {
        contestId,
        problemId,
        language,
        sourceCode,
      };
      const { data } = await api.post("/submissions", payload);
      setResult(data);
      const updatedHistory = await api.get(`/submissions/contest/${contestId}`);
      setHistory(updatedHistory.data);
    } catch (err) {
      setError(err.response?.data?.error ?? "Échec de la soumission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const latestSubmissions = useMemo(() => history.slice(0, 5), [history]);
  const statusClass = result ? statusColors[result.status] ?? "text-slate-200" : "";

  if (!problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950 text-white">
        <p>Chargement de l'énoncé...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Concours</p>
            <Link to={`/contest/${contestId}`} className="text-2xl font-semibold text-blue-400">
              ← Retour au concours
            </Link>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-slate-500">Problème</p>
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <p className="text-sm text-slate-400">
              {problem.difficulty} • {problem.maxScore} pts • Temps limite {problem.timeLimitMs} ms
            </p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="whitespace-pre-wrap text-slate-200 leading-relaxed">{problem.description}</p>
          <div>
            <h3 className="text-lg font-semibold mb-2">Cas de test publics</h3>
            {publicTestCases.length ? (
              <ul className="grid gap-3 md:grid-cols-2">
                {publicTestCases.map((test, index) => (
                  <li key={index} className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                    <p className="text-xs text-slate-400 uppercase">Entrée</p>
                    <pre className="text-sm text-slate-200 whitespace-pre-wrap">{test.input || ""}</pre>
                    <p className="text-xs text-slate-400 uppercase mt-2">Sortie attendue</p>
                    <pre className="text-sm text-emerald-300 whitespace-pre-wrap">{test.expectedOutput}</pre>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Aucun test public disponible.</p>
            )}
          </div>
        </div>

        <form
          onSubmit={submitCode}
          className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <label className="text-sm font-semibold text-slate-300">
              Langage
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="mt-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
              >
                {allowedLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {LANGUAGE_LABELS[lang] ?? lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="self-start md:self-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? "Soumission en cours..." : "Soumettre"}
            </button>
          </div>
          <textarea
            value={sourceCode}
            onChange={(event) => setSourceCode(event.target.value)}
            rows={18}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>

        {result && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Résultat de la soumission</h2>
              <span className={`text-lg font-bold ${statusClass}`}>{result.status}</span>
            </div>
            <p className="text-sm text-slate-300">
              Score obtenu : <span className="text-emerald-400 font-semibold">{result.score} / {problem.maxScore}</span>
            </p>
            {result.executionTimeMs !== undefined && (
              <p className="text-sm text-slate-400">
                Temps d'exécution total : {Math.round(result.executionTimeMs)} ms
              </p>
            )}
            {result.testResults?.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead>
                    <tr className="text-left text-xs uppercase text-slate-400">
                      <th className="px-3 py-2">Cas</th>
                      <th className="px-3 py-2">Entrée</th>
                      <th className="px-3 py-2">Sortie attendue</th>
                      <th className="px-3 py-2">Sortie obtenue</th>
                      <th className="px-3 py-2 text-right">Résultat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {result.testResults.map((test, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-sm text-slate-400">#{index + 1}</td>
                        <td className="px-3 py-2 text-sm whitespace-pre-wrap text-slate-200">
                          {test.input || ""}
                        </td>
                        <td className="px-3 py-2 text-sm whitespace-pre-wrap text-emerald-300">
                          {test.expectedOutput}
                        </td>
                        <td className="px-3 py-2 text-sm whitespace-pre-wrap text-slate-200">
                          {test.output}
                        </td>
                        <td className="px-3 py-2 text-sm text-right font-semibold">
                          {test.passed ? (
                            <span className="text-emerald-400">Réussi</span>
                          ) : (
                            <span className="text-red-400">Échec</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Aucun test exécuté.</p>
            )}
            {result.stderr && (
              <div>
                <p className="text-sm font-semibold text-red-400">Sortie d'erreur</p>
                <pre className="mt-2 bg-slate-950 border border-slate-800 rounded p-3 text-sm text-red-300 whitespace-pre-wrap">
                  {result.stderr}
                </pre>
              </div>
            )}
          </div>
        )}

        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Historique récent</h2>
            <span className="text-sm text-slate-400">{history.length} soumissions</span>
          </div>
          {latestSubmissions.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune soumission enregistrée pour ce concours.</p>
          ) : (
            <ul className="divide-y divide-slate-800">
              {latestSubmissions.map((submission) => (
                <li key={submission._id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-white">{submission.problemId?.title ?? "Problème"}</p>
                    <p className="text-slate-400">
                      {new Date(submission.createdAt).toLocaleString()} • {submission.language}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${statusColors[submission.status] ?? "text-slate-200"}`}>
                      {submission.status}
                    </p>
                    <p className="text-slate-400">{submission.score} pts</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}


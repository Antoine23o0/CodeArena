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


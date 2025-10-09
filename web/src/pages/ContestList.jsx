import React, { useEffect, useRef, useState } from "react";
import api from "../api/api.js";
import { Link } from "react-router-dom";

export default function ContestList() {
  const [contests, setContests] = useState([]);
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get("/contests", { signal: controller.signal });
        if (!cancelled) setContests(res.data || []);
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
          </div>
        ))}
      </div>
    </div>
  );
}



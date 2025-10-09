import { createContext, useEffect, useRef, useState } from "react";
import api from "../api/api.js";

export const ContestContext = createContext();

export const ContestProvider = ({ children }) => {
  const [contests, setContests] = useState([]);
  const fetchedRef = useRef(false);

  // Load contests on mount (protected against double calls in StrictMode)
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get("/contests", { signal: controller.signal });
        if (!cancelled) setContests(res.data || []);
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") {
          // aborted, ignore
        } else {
          console.error("fetch contests error", err);
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // Refresh list (callable from UI)
  const fetchContests = async () => {
    const res = await api.get("/contests");
    setContests(res.data || []);
    return res.data;
  };

  const createContest = async (payload) => {
    const res = await api.post("/contests", payload);
    // prepend new contest
    setContests((prev) => [res.data, ...prev]);
    return res.data;
  };

  const updateContest = async (id, payload) => {
    const res = await api.put(`/contests/${id}`, payload);
    setContests((prev) => prev.map((c) => (c._id === id ? res.data : c)));
    return res.data;
  };

  const deleteContest = async (id) => {
    await api.delete(`/contests/${id}`);
    setContests((prev) => prev.filter((c) => c._id !== id));
  };

  return (
    <ContestContext.Provider
      value={{
        contests,
        fetchContests,
        createContest,
        updateContest,
        deleteContest,
      }}
    >
      {children}
    </ContestContext.Provider>
  );
};

export default ContestContext;
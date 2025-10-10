import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import api, { apiOrigin } from "../api";

const resolveSocketUrl = () => {
  const explicit = import.meta.env.VITE_SOCKET_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  if (apiOrigin) {
    return apiOrigin;
  }
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    const fallbackPort = import.meta.env.VITE_API_FALLBACK_PORT?.trim() || "3000";
    if ((protocol === "http:" && fallbackPort === "80") || (protocol === "https:" && fallbackPort === "443")) {
      return `${protocol}//${hostname}`;
    }
    return `${protocol}//${hostname}:${fallbackPort}`;
  }
  return "http://localhost:3000";
};

export const useScoreboard = (contestId) => {
  const [scoreboard, setScoreboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const channel = contestId ?? "global";

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchInitial = async () => {
      try {
        if (contestId) {
          const { data } = await api.get(`/submissions/contest/${contestId}/scoreboard`);
          if (isMounted) setScoreboard(data);
        } else {
          const { data } = await api.get("/submissions/scoreboard");
          if (isMounted) setScoreboard(data);
        }
      } catch {
        if (isMounted) setScoreboard([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInitial();

    const socketUrl = resolveSocketUrl();
    const socket = io(socketUrl, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.emit("scoreboard:subscribe", { contestId: channel });

    const handleUpdate = ({ contestId: incomingChannel, scoreboard: payload }) => {
      if (incomingChannel === channel) {
        setScoreboard(payload);
      }
    };

    socket.on("scoreboard:update", handleUpdate);

    return () => {
      isMounted = false;
      socket.emit("scoreboard:unsubscribe", { contestId: channel });
      socket.off("scoreboard:update", handleUpdate);
      socket.disconnect();
    };
  }, [channel, contestId]);

  const rows = useMemo(
    () =>
      scoreboard.map((entry, index) => ({
        rank: index + 1,
        ...entry,
      })),
    [scoreboard],
  );

  return { scoreboard: rows, loading };
};


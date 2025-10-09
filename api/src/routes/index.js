import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l’API CodeArena" });
});

export default router;

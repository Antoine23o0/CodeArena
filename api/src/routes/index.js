import express from "express";
import authRoute from "./authRoutes.js"; 

const router = express.Router();

// route racine
router.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l’API CodeArena" });
});

//routes d’authentification : /api/register, /api/login, /api/profile
router.use("/", authRoute);

export default router;

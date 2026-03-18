import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

const favoritesFile = path.join(process.cwd(), "data", "favorites.json");

function ensureFile(file, initial = "[]") {
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, initial, "utf8");
  }
}

function readJson(file) {
  ensureFile(file);
  const raw = fs.readFileSync(file, "utf8");
  return JSON.parse(raw || "[]");
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

// GET FAVORITES FOR USER
router.get("/user/:userId", (req, res) => {
  try {
    const favorites = readJson(favoritesFile);
    const filtered = favorites.filter(f => String(f.userId) === req.params.userId);
    res.json(filtered);
  } catch (error) {
    console.error("GET FAVORITES ERROR:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// ADD FAVORITE
router.post("/", (req, res) => {
  try {
    const { userId, recipeId } = req.body;

    if (!userId || !recipeId) {
      return res.status(400).json({ message: "userId and recipeId are required." });
    }

    const favorites = readJson(favoritesFile);

    if (favorites.some(f => f.userId === userId && f.recipeId === recipeId)) {
      return res.status(400).json({ message: "Already in favorites." });
    }

    const newFavorite = {
      id: Date.now(),
      userId,
      recipeId,
      createdAt: new Date().toISOString()
    };

    favorites.push(newFavorite);
    writeJson(favoritesFile, favorites);

    res.status(201).json(newFavorite);
  } catch (error) {
    console.error("CREATE FAVORITE ERROR:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// REMOVE FAVORITE
router.delete("/", (req, res) => {
  try {
    const { userId, recipeId } = req.body;

    const favorites = readJson(favoritesFile);
    const filtered = favorites.filter(
      f => !(f.userId === userId && f.recipeId === recipeId)
    );

    if (filtered.length === favorites.length) {
      return res.status(404).json({ message: "Favorite not found." });
    }

    writeJson(favoritesFile, filtered);
    res.json({ message: "Favorite removed." });
  } catch (error) {
    console.error("DELETE FAVORITE ERROR:", error);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;


import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

const reviewsFile = path.join(process.cwd(), "data", "reviews.json");

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

// GET REVIEWS FOR A RECIPE
router.get("/recipe/:recipeId", (req, res) => {
  try {
    const reviews = readJson(reviewsFile);
    const filtered = reviews.filter(r => String(r.recipeId) === req.params.recipeId);
    res.json(filtered);
  } catch (error) {
    console.error("GET REVIEWS ERROR:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// CREATE REVIEW
router.post("/", (req, res) => {
  try {
    const { recipeId, userId, rating, comment } = req.body;

    if (!recipeId || !userId || !rating) {
      return res.status(400).json({ message: "recipeId, userId and rating are required." });
    }

    const reviews = readJson(reviewsFile);

    const newReview = {
      id: Date.now(),
      recipeId,
      userId,
      rating,
      comment: comment || "",
      createdAt: new Date().toISOString()
    };

    reviews.push(newReview);
    writeJson(reviewsFile, reviews);

    res.status(201).json(newReview);
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;

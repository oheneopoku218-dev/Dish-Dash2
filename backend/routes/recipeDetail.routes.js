import express from "express";
import fs from "fs";
import path from "path";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();
const recipesFile = path.join(process.cwd(), "data", "recipes.json");

function readJson() {
  if (!fs.existsSync(recipesFile)) return [];
  return JSON.parse(fs.readFileSync(recipesFile, "utf8") || "[]");
}

/**
 * Convert a YouTube watch/share URL to an embed URL.
 * Returns null if the URL is not a recognised YouTube link.
 */
function getYouTubeEmbed(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

// GET /recipe/:id  →  server-rendered recipe detail page
router.get("/:id", optionalAuth, (req, res) => {
  try {
    const recipes = readJson();
    const recipe = recipes.find((r) => String(r.id) === req.params.id);

    if (!recipe) {
      return res
        .status(404)
        .render("recipe-detail", { recipe: null, embedUrl: null, error: "Recipe not found." });
    }

    const isOwner = req.user && String(recipe.authorId) === String(req.user.id);
    if (!recipe.isPublic && !isOwner) {
      return res
        .status(403)
        .render("recipe-detail", { recipe: null, embedUrl: null, error: "This recipe is private." });
    }

    const embedUrl = getYouTubeEmbed(recipe.videoUrl);
    res.render("recipe-detail", { recipe, embedUrl, error: null });
  } catch (err) {
    console.error("RECIPE DETAIL PAGE ERROR:", err);
    res.status(500).send("<h1>Server error</h1>");
  }
});

export default router;

import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

const recipesFile = path.join(process.cwd(), "data", "recipes.json");

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

// GET ALL RECIPES
router.get("/", (req, res) => {
  try {
    const recipes = readJson(recipesFile);
    res.json(recipes);
  } catch (error) {
    console.error("GET RECIPES ERROR:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// CREATE RECIPE
router.post("/", (req, res) => {
  try {
    const { title, description, ingredients, steps, authorId } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    const recipes = readJson(recipesFile);

    const newRecipe = {
      id: Date.now(),
      title,
      description,
      ingredients: ingredients || [],
      steps: steps || [],
      authorId: authorId || null,
      createdAt: new Date().toISOString()
    };

    recipes.push(newRecipe);
    writeJson(recipesFile, recipes);

    res.status(201).json(newRecipe);
  } catch (error) {
    console.error("CREATE RECIPE ERROR:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// GET SINGLE RECIPE
router.get("/:id", (req, res) => {
  try {
    const recipes = readJson(recipesFile);
    const recipe = recipes.find(r => String(r.id) === req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    res.json(recipe);
  } catch (error) {
    console.error("GET RECIPE ERROR:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// DELETE RECIPE
router.delete("/:id", (req, res) => {
  try {
    const recipes = readJson(recipesFile);
    const filtered = recipes.filter(r => String(r.id) !== req.params.id);

    if (filtered.length === recipes.length) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    writeJson(recipesFile, filtered);
    res.json({ message: "Recipe deleted." });
  } catch (error) {
    console.error("DELETE RECIPE ERROR:", error);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;





import express from "express";
  import fs from "fs";
  import path from "path";
  import { authenticate, optionalAuth } from "../middleware/auth.js";

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
  router.get("/", optionalAuth, (req, res) => {
    try {
      const recipes = readJson(recipesFile);
      const visible = recipes.filter(r =>
        r.isPublic || (req.user && String(r.authorId) === String(req.user.id))
      );
      res.json(visible);
    } catch (error) {
      console.error("GET RECIPES ERROR:", error);
      res.status(500).json({ message: "Server error." });
    }
  });

  // CREATE RECIPE
  router.post("/", authenticate, (req, res) => {
    try {
      const { title, description, ingredients, steps, cookingTime, difficulty, mealType, category, dietaryTags, origin, tradition, isPublic, culturalContext } = req.body;

      if (!title) return res.status(400).json({ message: "Title is required." });
      if (!category) return res.status(400).json({ message: "Category is required." });

      const validCategories = ["breakfast", "lunch", "dinner", "snack", "desert", "dessert"];
      if (!validCategories.includes(category.toLowerCase()))
        return res.status(400).json({ message: "Valid category required: breakfast, lunch, dinner, snack, dessert" });

      const recipes = readJson(recipesFile);

      const newRecipe = {
        id: Date.now(),
        title,
        description: description || "",
        ingredients: ingredients || [],
        steps: steps || [],
        cookingTime: cookingTime || null,
        difficulty: difficulty || null,
        mealType: mealType || category,
        category: category.toLowerCase(),
        dietaryTags: dietaryTags || [],
        origin: origin || "",
        tradition: tradition || "",
        culturalContext: culturalContext || {},
        authorId: req.user.id,
        authorName: req.user.username,
        isPublic: isPublic === true,
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
  router.get("/:id", optionalAuth, (req, res) => {
    try {
      const recipes = readJson(recipesFile);
      const recipe = recipes.find(r => String(r.id) === req.params.id);

      if (!recipe) return res.status(404).json({ message: "Recipe not found." });

      const isOwner = req.user && String(recipe.authorId) === String(req.user.id);
      if (!recipe.isPublic && !isOwner)
        return res.status(403).json({ message: "This recipe is private." });

      res.json(recipe);
    } catch (error) {
      console.error("GET RECIPE ERROR:", error);
      res.status(500).json({ message: "Server error." });
    }
  });

  // UPDATE VISIBILITY
  router.patch("/:id/visibility", authenticate, (req, res) => {
    try {
      const recipes = readJson(recipesFile);
      const index = recipes.findIndex(r => String(r.id) === req.params.id);

      if (index === -1) return res.status(404).json({ message: "Recipe not found." });
      if (String(recipes[index].authorId) !== String(req.user.id))
        return res.status(403).json({ message: "Not your recipe." });

      recipes[index].isPublic = req.body.isPublic === true;
      writeJson(recipesFile, recipes);

      res.json(recipes[index]);
    } catch (error) {
      console.error("VISIBILITY ERROR:", error);
      res.status(500).json({ message: "Server error." });
    }
  });

  // DELETE RECIPE
  router.delete("/:id", authenticate, (req, res) => {
    try {
      const recipes = readJson(recipesFile);
      const recipe = recipes.find(r => String(r.id) === req.params.id);

      if (!recipe) return res.status(404).json({ message: "Recipe not found." });
      if (String(recipe.authorId) !== String(req.user.id))
        return res.status(403).json({ message: "Not your recipe." });

      const filtered = recipes.filter(r => String(r.id) !== req.params.id);
      writeJson(recipesFile, filtered);

      res.json({ message: "Recipe deleted." });
    } catch (error) {
      console.error("DELETE RECIPE ERROR:", error);
      res.status(500).json({ message: "Server error." });
    }
  });

  export default router;

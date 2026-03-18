import Recipe from "../models/recipe.model.js";

export const createRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.create(req.body);
    res.status(201).json(recipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().populate("reviews");
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

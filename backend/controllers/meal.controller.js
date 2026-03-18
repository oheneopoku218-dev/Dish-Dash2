import Meal from "../models/meal.model.js";

export const getMealsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const meals = await Meal.find({ category });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch meals" });
  }
};

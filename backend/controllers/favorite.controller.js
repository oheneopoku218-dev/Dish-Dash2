import Favorite from "../models/favorite.model.js";

export const addFavorite = async (req, res) => {
  try {
    const { userId, recipeId } = req.body;
    const fav = await Favorite.create({ userId, recipeId });
    res.json(fav);
  } catch (err) {
    res.status(500).json({ error: "Failed to add favorite" });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const { userId } = req.params;
    const favs = await Favorite.find({ userId });
    res.json(favs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
};

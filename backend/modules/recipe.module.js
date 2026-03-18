import Recipe from "../recipe.model.js";

export const createRecipe = async (data) => {
  return await Recipe.create(data);
};
export const getAllRecipes = async () => {
  return await Recipe.find({});
};

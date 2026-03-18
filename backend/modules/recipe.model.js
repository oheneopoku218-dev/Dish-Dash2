import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
  title: String,
  ingredients: [String],
  instructions: String,
});

export default mongoose.models.Recipe || mongoose.model("Recipe", recipeSchema);

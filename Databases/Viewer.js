// Display a single recipe loaded from localStorage (set by viewRecipe())
function displayRecipeDetail() {
  const container = document.getElementById("recipe-detail");
  if (!container) return;

  const stored = localStorage.getItem("selectedRecipe");
  if (!stored) {
    container.innerHTML = "<p>No recipe selected. <a href='Dish-Dash.html'>Go back</a></p>";
    return;
  }

  const recipe = JSON.parse(stored);
  container.innerHTML = `
    <h2>${recipe.name || recipe.title || "Untitled Recipe"}</h2>
    <p><strong>Category:</strong> ${recipe.category || recipe.mealType || "N/A"}</p>
    <p><strong>Description:</strong> ${recipe.description || "N/A"}</p>
    <p><strong>Ingredients:</strong> ${(recipe.ingredients || []).join(", ") || "N/A"}</p>
    <p><strong>Instructions:</strong> ${recipe.instructions || (recipe.steps || []).join(" ") || "N/A"}</p>
    <p><strong>Cooking Time:</strong> ${recipe.cookingTime ? recipe.cookingTime + " mins" : "N/A"}</p>
    <p><strong>Difficulty:</strong> ${recipe.difficulty || "N/A"}</p>
    <button onclick="window.history.back()">Back</button>
  `;
}

window.onload = displayRecipeDetail;

 const RECIPES_API = `${API_BASE}/api/recipes`;

  async function loadRecipes() {
    const container = document.getElementById("recipes-container");
    if (!container) return;

    container.textContent = "Loading recipes...";

    try {
      const res = await fetch(RECIPES_API);
      if (!res.ok) throw new Error("Failed to load recipes");
      const recipes = await res.json();

      if (!recipes.length) {
        container.textContent = "No recipes found.";
        return;
      }

      container.innerHTML = recipes.map((r) => `
        <div class="recipe-card">
          <h3>${r.title || "Untitled"}</h3>
          <p>${r.description || ""}</p>
        </div>
      `).join("");
    } catch (err) {
      console.error("Recipes load error:", err);
      container.textContent = "Error loading recipes.";
    }
  }

  document.addEventListener("DOMContentLoaded", loadRecipes);
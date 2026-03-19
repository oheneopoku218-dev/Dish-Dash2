
  const FAVORITES_API = `${API_BASE}/api/favorites`;
  const RECIPES_API = `${API_BASE}/api/recipes`;

  async function loadFavorites() {
    const userId = localStorage.getItem("userId");
    const container = document.getElementById("favorites-container");
    if (!container) return;

    if (!userId) {
      container.textContent = "Please log in to see favorites.";
      return;
    }

    container.textContent = "Loading favorites...";

    try {
      const [favRes, recipeRes] = await Promise.all([
        fetch(`${FAVORITES_API}/user/${userId}`),
        fetch(RECIPES_API)
      ]);

      if (!favRes.ok) throw new Error("Failed to load favorites");
      const favorites = await favRes.json();

      if (!favorites.length) {
        container.textContent = "No favorites yet.";
        return;
      }

      const recipes = recipeRes.ok ? await recipeRes.json() : [];

      container.innerHTML = favorites.map((f) => {
        const recipe = recipes.find(r => String(r.id) === String(f.recipeId));
        return `
          <div class="favorite-card">
            <h3>${recipe ? recipe.title : "Recipe #" + f.recipeId}</h3>
            ${recipe ? `<p>${recipe.description || ""}</p>` : ""}
          </div>
        `;
      }).join("");
    } catch (err) {
      console.error("Favorites load error:", err);
      container.textContent = "Error loading favorites.";
    }
  }

  document.addEventListener("DOMContentLoaded", loadFavorites);

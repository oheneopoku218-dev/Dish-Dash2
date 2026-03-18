const FAVORITES_API =
  "https://ideal-pancake-x5g9g655wwgphrpr-5000.app.github.dev/api/favorites";

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
    const res = await fetch(`${FAVORITES_API}/user/${userId}`);
    if (!res.ok) throw new Error("Failed to load favorites");
    const items = await res.json();

    if (!items.length) {
      container.textContent = "No favorites yet.";
      return;
    }

    container.innerHTML = items
      .map(
        (f) => `
      <div class="favorite-card">
        <p><strong>Recipe ID:</strong> ${f.recipeId}</p>
      </div>
    `
      )
      .join("");
  } catch (err) {
    console.error("Favorites load error:", err);
    container.textContent = "Error loading favorites.";
  }
}

document.addEventListener("DOMContentLoaded", loadFavorites);

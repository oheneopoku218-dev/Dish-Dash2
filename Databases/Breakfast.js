breakfast.js
  const BREAKFAST_API = "https://ideal-pancake-x5g9g655wwgphrpr-5000.app.github.dev/api/breakfast";

  async function loadBreakfast() {
    const container = document.getElementById("breakfast-container");
    if (!container) return;

    container.textContent = "Loading breakfast recipes...";

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(BREAKFAST_API, { headers });

      if (!res.ok) throw new Error("Failed to load breakfast recipes");

      const items = await res.json();

      if (!items.length) {
        container.textContent = "No breakfast recipes found.";
        return;
      }

      container.innerHTML = items.map(item => `
        <div class="meal-card">
          <h3>${item.title || "Untitled"}</h3>
          ${!item.isPublic ? `<span class="private-badge">Private</span>` : ""}
          <p><strong>By:</strong> ${item.authorName || "Unknown"}</p>

          ${item.description ? `<p>${item.description}</p>` : ""}

          ${item.ingredients?.length ? `
            <p><strong>Ingredients:</strong> ${item.ingredients.join(", ")}</p>
          ` : ""}

          ${item.steps?.length ? `
            <ol>${item.steps.map(s => `<li>${s}</li>`).join("")}</ol>
          ` : ""}
        </div>
      `).join("");

    } catch (err) {
      console.error("Breakfast load error:", err);
      container.textContent = "Error loading breakfast recipes.";
    }
  }

  document.addEventListener("DOMContentLoaded", loadBreakfast);

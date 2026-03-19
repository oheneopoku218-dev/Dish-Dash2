
  const DESERT_API = `${API_BASE}/api/desert`;

  async function loadDesert() {
    const container = document.getElementById("desert-list");
    if (!container) return;
    container.textContent = "Loading desserts...";
    try {
      const res = await fetch(DESERT_API);
      if (!res.ok) throw new Error("Failed to load desserts");
      const items = await res.json();
      if (!items.length) { container.textContent = "No desserts found."; return; }
      container.innerHTML = items.map((item) => `
        <div class="meal-card">
          <h3>${item.name || "Untitled"}</h3>
          ${item.calories ? `<p><strong>Calories:</strong> ${item.calories}</p>` : ""}
          ${item.ingredients?.length ? `<p><strong>Ingredients:</strong> ${item.ingredients.join(", ")}</p>` : ""}
        </div>
      `).join("");
    } catch (err) {
      console.error("Desert load error:", err);
      container.textContent = "Error loading desserts.";
    }
  }

  document.addEventListener("DOMContentLoaded", loadDesert);
  
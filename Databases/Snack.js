 const SNACK_API = `${API_BASE}/api/snack`;

  async function loadSnacks() {
    const container = document.getElementById("snack-container");
    if (!container) return;
    container.textContent = "Loading snacks...";
    try {
      const res = await fetch(SNACK_API);
      if (!res.ok) throw new Error("Failed to load snacks");
      const items = await res.json();
      if (!items.length) { container.textContent = "No snacks found."; return; }
      container.innerHTML = items.map((item) => `
        <div class="meal-card">
          <h3>${item.name || "Untitled"}</h3>
          ${item.calories ? `<p><strong>Calories:</strong> ${item.calories}</p>` : ""}
          ${item.ingredients?.length ? `<p><strong>Ingredients:</strong> ${item.ingredients.join(", ")}</p>` : ""}
        </div>
      `).join("");
    } catch (err) {
      console.error("Snack load error:", err);
      container.textContent = "Error loading snacks.";
    }
  }

  document.addEventListener("DOMContentLoaded", loadSnacks);
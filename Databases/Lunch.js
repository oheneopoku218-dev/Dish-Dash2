const LUNCH_API = `${API_BASE}/api/lunch`;

  async function loadLunch() {
    const container = document.getElementById("lunch-container");
    if (!container) return;
    container.textContent = "Loading lunch...";
    try {
      const res = await fetch(LUNCH_API);
      if (!res.ok) throw new Error("Failed to load lunch");
      const items = await res.json();
      if (!items.length) { container.textContent = "No lunch items found."; return; }
      container.innerHTML = items.map((item) => `
        <div class="meal-card">
          <h3>${item.name || "Untitled"}</h3>
          ${item.calories ? `<p><strong>Calories:</strong> ${item.calories}</p>` : ""}
          ${item.ingredients?.length ? `<p><strong>Ingredients:</strong> ${item.ingredients.join(", ")}</p>` : ""}
        </div>
      `).join("");
    } catch (err) {
      console.error("Lunch load error:", err);
      container.textContent = "Error loading lunch.";
    }
  }

  document.addEventListener("DOMContentLoaded", loadLunch);

  
  
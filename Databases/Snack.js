const SNACK_API = `${API_BASE}/api/snack`;

async function loadSnacks() {
  const container = document.getElementById("snack-container");
  if (!container) return;
  container.textContent = "Loading snacks...";
  try {
    const userId = localStorage.getItem("userId");
    const headers = userId ? { "x-user-id": userId } : {};
    const res = await fetch(SNACK_API, { headers });
    if (!res.ok) throw new Error("Failed to load snacks");
    const items = await res.json();
    if (!items.length) { container.textContent = "No snacks found."; return; }
    container.innerHTML = items.map(item => `
      <div class="meal-card">
        <h3>${item.title || item.name || "Untitled"}</h3>
        ${!item.isPublic ? `<span class="private-badge">Private</span>` : ""}
        <p><strong>By:</strong> ${item.authorName || "Unknown"}</p>
        ${item.description ? `<p>${item.description}</p>` : ""}
        ${item.ingredients?.length ? `<p><strong>Ingredients:</strong> ${item.ingredients.join(", ")}</p>` : ""}
        ${item.steps?.length ? `<ol>${item.steps.map(s => `<li>${s}</li>`).join("")}</ol>` : ""}
      </div>
    `).join("");
  } catch (err) {
    console.error("Snack load error:", err);
    container.textContent = "Error loading snacks.";
  }
}

document.addEventListener("DOMContentLoaded", loadSnacks);

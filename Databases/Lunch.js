const LUNCH_API = `${API_BASE}/api/lunch`;

async function loadLunch() {
  const container = document.getElementById("lunch-container");
  if (!container) return;
  container.textContent = "Loading lunch recipes...";
  try {
    const userId = localStorage.getItem("userId");
    const headers = userId ? { "x-user-id": userId } : {};
    const res = await fetch(LUNCH_API, { headers });
    if (!res.ok) throw new Error("Failed to load lunch");
    const items = await res.json();
    if (!items.length) { container.textContent = "No lunch recipes found."; return; }
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
    console.error("Lunch load error:", err);
    container.textContent = "Error loading lunch.";
  }
}

document.addEventListener("DOMContentLoaded", loadLunch);

const SNACK_API = `${API_BASE}/api/snack`;

function viewRecipe(recipe) {
  localStorage.setItem("selectedRecipe", JSON.stringify(recipe));
  window.location.href = "Viewer.html";
}

async function loadSnack() {
  const container = document.getElementById("snack-container");
  if (!container) return;
  container.textContent = "Loading snack recipes...";
  try {
    const userId = localStorage.getItem("userId");
    const headers = userId ? { "x-user-id": userId } : {};
    const res = await fetch(SNACK_API, { headers });
    if (!res.ok) throw new Error("Failed to load snack");
    const items = await res.json();
    if (!items.length) { container.textContent = "No snack recipes found."; return; }
    container.innerHTML = items.map(item => `
      <div class="meal-card" onclick='viewRecipe(${JSON.stringify(item)})' style="cursor:pointer">
        <h3>${item.title || item.name || "Untitled"}</h3>
        ${!item.isPublic ? `<span class="private-badge">Private</span>` : ""}
        <p><strong>By:</strong> ${item.authorName || "Unknown"}</p>
        ${item.description ? `<p>${item.description}</p>` : ""}
        ${item.ingredients?.length ? `<p><strong>Ingredients:</strong> ${item.ingredients.join(", ")}</p>` : ""}
      </div>
    `).join("");
  } catch (err) {
    console.error("Snack load error:", err);
    container.textContent = "Error loading snack recipes.";
  }
}

document.addEventListener("DOMContentLoaded", loadSnack);

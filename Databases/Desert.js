const DESERT_API = `${API_BASE}/api/desert`;

function viewRecipe(recipe) {
  localStorage.setItem("selectedRecipe", JSON.stringify(recipe));
  window.location.href = "Viewer.html";
}

async function loadDesert() {
  const container = document.getElementById("desert-list");
  if (!container) return;
  container.textContent = "Loading desserts...";
  try {
    const userId = localStorage.getItem("userId");
    const headers = userId ? { "x-user-id": userId } : {};
    const res = await fetch(DESERT_API, { headers });
    if (!res.ok) throw new Error("Failed to load desserts");
    const items = await res.json();
    if (!items.length) { container.textContent = "No desserts found."; return; }
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
    console.error("Desert load error:", err);
    container.textContent = "Error loading desserts.";
  }
}

document.addEventListener("DOMContentLoaded", loadDesert);

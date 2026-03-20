const DINNER_API = `${API_BASE}/api/dinner`;

function viewRecipe(recipe) {
  localStorage.setItem("selectedRecipe", JSON.stringify(recipe));
  window.location.href = "Viewer.html";
}

async function loadDinner() {
  const container = document.getElementById("dinner-container
lunch-container");
  if (!container) return;
  container.textContent = "Loading dinner recipes...";
  try {
    const userId = localStorage.getItem("userId");
    const headers = userId ? { "x-user-id": userId } : {};
    const res = await fetch(DINNER_API, { headers });
    if (!res.ok) throw new Error("Failed to load dinner");
    const items = await res.json();
    if (!items.length) { container.textContent = "No dinner recipes found."; return; }
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
    console.error("Dinner load error:", err);
    container.textContent = "Error loading dinner recipes.";
  }
}

document.addEventListener("DOMContentLoaded", loadDinner);

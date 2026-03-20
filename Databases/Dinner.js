const DINNER_API = `${API_BASE}/api/dinner`;

function viewRecipe(recipe) {
  localStorage.setItem("selectedRecipe", JSON.stringify(recipe));
  window.location.href = "Viewer.html";
}

async function loadDinner() {
  const container = document.getElementById("dinner-container
lunch-container
snack-container");
  if (!container) return;
  container.textContent = "Loading...";
  try {
    const userId = localStorage.getItem("userId");
    const headers = userId ? { "x-user-id": userId } : {};
    const res = await fetch(DINNER_API, { headers });
    if (!res.ok) throw new Error("Failed to load");
    const items = await res.json();
    if (!items.length) { container.textContent = "No recipes found."; return; }
    container.innerHTML = items.map(item => `
      <div class="meal-card" onclick='viewRecipe(${JSON.stringify(item).replace(/'/g, "&#39;")})' style="cursor:pointer">
        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title || ""}" style="width:100%;height:180px;object-fit:cover;border-radius:8px 8px 0 0;margin-bottom:12px;" onerror="this.style.display='none'">` : ""}
        <h3>${item.title || item.name || "Untitled"}</h3>
        ${!item.isPublic ? `<span class="private-badge">Private</span>` : ""}
        <p style="color:#666;font-size:0.85rem;">By ${item.authorName || "Unknown"}</p>
        ${item.description ? `<p>${item.description}</p>` : ""}
        ${item.cookingTime ? `<p><strong>Time:</strong> ${item.cookingTime} mins</p>` : ""}
      </div>
    `).join("");
  } catch (err) {
    console.error("Dinner load error:", err);
    container.textContent = "Error loading recipes.";
  }
}

document.addEventListener("DOMContentLoaded", loadDinner);

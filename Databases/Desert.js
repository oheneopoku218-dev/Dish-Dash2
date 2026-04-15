function viewRecipe(recipe) {
  localStorage.setItem("selectedRecipe", JSON.stringify(recipe));
  window.location.href = "recipe-detail.html";
}

async function saveToRecipeBox(btn, recipeId) {
  const userId = localStorage.getItem("userId");
  if (!userId) { window.location.href = "Login.html"; return; }
  btn.disabled = true;
  try {
    const res = await fetch(`${API_BASE}/api/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, recipeId: String(recipeId) })
    });
    const data = await res.json();
    if (res.ok || data.message === "Already in favorites.") {
      btn.textContent = "Saved";
      btn.style.background = "#ccc";
      btn.style.cursor = "default";
    } else {
      btn.disabled = false;
    }
  } catch { btn.disabled = false; }
}

let _dsAllItems = [];
let _dsSavedIds = new Set();
let _dsUserId = null;

function renderDesertItems(items) {
  const container = document.getElementById("desert-list");
  if (!container) return;
  if (!items.length) { container.innerHTML = '<p style="padding:30px;color:#999;">No recipes found.</p>'; return; }
  container.innerHTML = items.map(item => {
    const isOwn = _dsUserId && String(item.authorId) === String(_dsUserId);
    const alreadySaved = _dsSavedIds.has(String(item.id));
    return `
      <div class="meal-card" onclick='viewRecipe(${JSON.stringify(item).replace(/'/g, "&#39;")})' style="cursor:pointer">
        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title || ""}" style="width:100%;height:180px;margin-bottom:12px;" onerror="this.style.display='none'">` : ""}
        <h3>${item.title || item.name || "Untitled"}</h3>
        ${!item.isPublic ? `<span class="private-badge">Private</span>` : ""}
        <p style="color:#666;font-size:0.85rem;">By ${item.authorName || "Unknown"}</p>
        ${item.description ? `<p>${item.description}</p>` : ""}
        ${item.cookingTime ? `<p><strong>Time:</strong> ${item.cookingTime} mins</p>` : ""}
        ${!isOwn ? `
          <button onclick="event.stopPropagation(); saveToRecipeBox(this, '${item.id}')"
            style="margin-top:10px;padding:6px 12px;background:${alreadySaved ? "#ccc" : "#ff8c42"};color:white;border:none;cursor:${alreadySaved ? "default" : "pointer"};font-size:0.85rem;"
            ${alreadySaved ? "disabled" : ""}
          >${alreadySaved ? "Saved" : "Save to Recipe Box"}</button>
        ` : ""}
      </div>
    `;
  }).join("");
}

async function loadDesert() {
  const container = document.getElementById("desert-list");
  if (!container) return;
  container.textContent = "Loading...";

  _dsUserId = localStorage.getItem("userId");
  const headers = _dsUserId ? { "x-user-id": _dsUserId } : {};

  try {
    const res = await fetch(`${API_BASE}/api/recipes`, { headers });
    if (!res.ok) throw new Error("Failed to load");
    const allRecipes = await res.json();
    _dsAllItems = allRecipes.filter(item => ["dessert", "desert"].includes((item.category || "").toLowerCase()));
    localStorage.setItem("cachedDessertRecipes", JSON.stringify(_dsAllItems));
  } catch (err) {
    const cached = localStorage.getItem("cachedDessertRecipes");
    _dsAllItems = cached ? JSON.parse(cached) : [];
  }

  if (!_dsAllItems.length) { container.textContent = "No recipes found."; return; }

  if (_dsUserId) {
    try {
      const favRes = await fetch(`${API_BASE}/api/favorites/user/${_dsUserId}`);
      const favs = favRes.ok ? await favRes.json() : [];
      _dsSavedIds = new Set(favs.map(f => String(f.recipeId)));
    } catch {}
  }

  renderDesertItems(_dsAllItems);

  const filterInput = document.getElementById("ingredient-filter");
  if (filterInput) {
    filterInput.addEventListener("input", () => {
      const q = filterInput.value.trim().toLowerCase();
      if (!q) { renderDesertItems(_dsAllItems); return; }
      const filtered = _dsAllItems.filter(item =>
        Array.isArray(item.ingredients) &&
        item.ingredients.some(ing => (ing || "").toLowerCase().includes(q))
      );
      renderDesertItems(filtered);
    });
  }
}

document.addEventListener("DOMContentLoaded", loadDesert);

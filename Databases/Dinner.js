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

let _dnAllItems = [];
let _dnSavedIds = new Set();
let _dnUserId = null;

function renderDinnerItems(items) {
  const container = document.getElementById("dinner-container");
  if (!container) return;
  if (!items.length) { container.innerHTML = '<p style="padding:30px;color:#999;">No recipes found.</p>'; return; }
  container.innerHTML = items.map(item => {
    const isOwn = _dnUserId && String(item.authorId) === String(_dnUserId);
    const alreadySaved = _dnSavedIds.has(String(item.id));
    return `
      <div class="meal-card" onclick='viewRecipe(${JSON.stringify(item).replace(/'/g, "&#39;")})' style="cursor:pointer">
        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title || ""}" style="width:100%;height:180px;margin-bottom:12px;" onerror="this.style.display='none'">` : ""}
        ${item.authorName === "itz.oxene" ? `<div style="display:inline-block;background:linear-gradient(135deg,#FFD700,#FFA500);color:#000;font-size:0.72rem;font-weight:800;padding:3px 9px;margin-bottom:6px;letter-spacing:0.04em;">★ FEATURED</div>` : ""}
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

async function loadDinner() {
  const container = document.getElementById("dinner-container");
  if (!container) return;
  container.textContent = "Loading...";

  _dnUserId = localStorage.getItem("userId");
  const headers = _dnUserId ? { "x-user-id": _dnUserId } : {};

  try {
    const res = await fetch(`${API_BASE}/api/dinner`, { headers });
    if (!res.ok) throw new Error("Failed to load");
    _dnAllItems = await res.json();
    localStorage.setItem("cachedDinnerRecipes", JSON.stringify(_dnAllItems));
  } catch (err) {
    const cached = localStorage.getItem("cachedDinnerRecipes");
    _dnAllItems = cached ? JSON.parse(cached) : [];
  }

  if (!_dnAllItems.length) { container.textContent = "No recipes found."; return; }

  if (_dnUserId) {
    try {
      const favRes = await fetch(`${API_BASE}/api/favorites/user/${_dnUserId}`);
      const favs = favRes.ok ? await favRes.json() : [];
      _dnSavedIds = new Set(favs.map(f => String(f.recipeId)));
    } catch {}
  }

  renderDinnerItems(_dnAllItems);

  const filterInput = document.getElementById("ingredient-filter");
  if (filterInput) {
    filterInput.addEventListener("input", () => {
      const q = filterInput.value.trim().toLowerCase();
      if (!q) { renderDinnerItems(_dnAllItems); return; }
      const filtered = _dnAllItems.filter(item =>
        Array.isArray(item.ingredients) &&
        item.ingredients.some(ing => (ing || "").toLowerCase().includes(q))
      );
      renderDinnerItems(filtered);
    });
  }
}

document.addEventListener("DOMContentLoaded", loadDinner);

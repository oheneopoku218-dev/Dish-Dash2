const BREAKFAST_API = `${API_BASE}/api/breakfast`;

function viewRecipe(recipe) {
  localStorage.setItem("selectedRecipe", JSON.stringify(recipe));
  window.location.href = "Viewer.html";
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
      btn.textContent = "Saved ✓";
      btn.style.background = "#ccc";
      btn.style.cursor = "default";
    } else {
      btn.disabled = false;
    }
  } catch (err) {
    btn.disabled = false;
  }
}

async function loadBreakfast() {
  const container = document.getElementById("breakfast-container");
  if (!container) return;
  container.textContent = "Loading...";
  try {
    const userId = localStorage.getItem("userId");
    const headers = userId ? { "x-user-id": userId } : {};
    const res = await fetch(BREAKFAST_API, { headers });
    if (!res.ok) throw new Error("Failed to load");
    const items = await res.json();
    if (!items.length) { container.textContent = "No recipes found."; return; }

    // Load saved recipe IDs for this user
    let savedIds = new Set();
    if (userId) {
      try {
        const favRes = await fetch(`${API_BASE}/api/favorites/user/${userId}`);
        const favs = favRes.ok ? await favRes.json() : [];
        savedIds = new Set(favs.map(f => String(f.recipeId)));
      } catch {}
    }

    container.innerHTML = items.map(item => {
      const isOwn = userId && String(item.authorId) === String(userId);
      const alreadySaved = savedIds.has(String(item.id));
      return `
        <div class="meal-card" onclick='viewRecipe(${JSON.stringify(item).replace(/'/g, "&#39;")})' style="cursor:pointer">
          ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title || ""}" style="width:100%;height:180px;object-fit:cover;border-radius:6px 6px 0 0;margin-bottom:12px;" onerror="this.style.display='none'">` : ""}
          <h3>${item.title || item.name || "Untitled"}</h3>
          ${!item.isPublic ? `<span class="private-badge">Private</span>` : ""}
          <p style="color:#666;font-size:0.85rem;">By ${item.authorName || "Unknown"}</p>
          ${item.description ? `<p>${item.description}</p>` : ""}
          ${item.cookingTime ? `<p><strong>Time:</strong> ${item.cookingTime} mins</p>` : ""}
          ${!isOwn ? `
            <button
              onclick="event.stopPropagation(); saveToRecipeBox(this, '${item.id}')"
              style="margin-top:10px;padding:6px 12px;background:${alreadySaved ? "#ccc" : "#ff8c42"};color:white;border:none;border-radius:6px;cursor:${alreadySaved ? "default" : "pointer"};font-size:0.85rem;"
              ${alreadySaved ? "disabled" : ""}
            >${alreadySaved ? "Saved ✓" : "Save to Recipe Box"}</button>
          ` : ""}
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Load error:", err);
    container.textContent = "Error loading recipes.";
  }
}

document.addEventListener("DOMContentLoaded", loadBreakfast);

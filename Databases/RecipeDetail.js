/* RecipeDetail.js — populates recipe-detail.html from localStorage */

function getYouTubeEmbed(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function loadDetail() {
  const container = document.getElementById("detail-content");
  if (!container) return;

  const stored = localStorage.getItem("selectedRecipe");
  if (!stored) {
    container.innerHTML = `<p class="empty-msg">No recipe selected. <a href="Dish-Dash.html">Go home</a></p>`;
    return;
  }

  const r = JSON.parse(stored);
  const cc = r.culturalContext || {};
  const userId = localStorage.getItem("userId");
  const isOwn = userId && String(r.authorId) === String(userId);
  let alreadySaved = false;

  if (userId && !isOwn) {
    try {
      const favRes = await fetch(`${API_BASE}/api/favorites/user/${userId}`);
      const favs = favRes.ok ? await favRes.json() : [];
      alreadySaved = favs.some(f => String(f.recipeId) === String(r.id));
    } catch { /* ignore */ }
  }

  // ── Photo src ─────────────────────────────────────────────────────────
  const photoSrc = r.imageUrl || "";
  const photoHTML = photoSrc
    ? `<img class="recipe-photo" src="${escHtml(photoSrc)}" alt="${escHtml(r.title)}" onerror="this.style.background='linear-gradient(135deg,#ffe8d4,#fdf0e5)';this.removeAttribute('src')">`
    : `<div class="recipe-photo"></div>`;

  // ── Pills ─────────────────────────────────────────────────────────────
  const mealLabel = r.mealType || r.category || "";
  const pillsHTML = [
    mealLabel     ? `<span class="pill">${escHtml(mealLabel)}</span>` : "",
    r.cookingTime ? `<span class="pill">⏱ ${escHtml(String(r.cookingTime))} min</span>` : "",
    r.difficulty  ? `<span class="pill">${escHtml(r.difficulty)}</span>` : "",
    ...(r.dietaryTags || []).filter(Boolean).map(t => `<span class="pill">${escHtml(t)}</span>`)
  ].filter(Boolean).join("");

  // ── Vault button ──────────────────────────────────────────────────────
  const vaultBtn = !isOwn
    ? `<button id="vault-btn" class="btn-vault${alreadySaved ? " saved" : ""}" data-id="${r.id}" ${alreadySaved ? "disabled" : ""}>
         ${alreadySaved ? "Saved to Vault ✓" : "+ Add to Meal Vault"}
       </button>`
    : "";

  // ── Ingredients ───────────────────────────────────────────────────────
  const ingredientsHTML = (r.ingredients && r.ingredients.length)
    ? `<div class="ingredients-box">
         <h3 class="box-heading">Ingredients</h3>
         ${r.ingredients.map(i => `<div class="ingredient-row">${escHtml(i)}</div>`).join("")}
       </div>`
    : "";

  // ── Steps ─────────────────────────────────────────────────────────────
  const stepsHTML = (r.steps && r.steps.length)
    ? `<div class="steps-box">
         <h3 class="box-heading">Instructions</h3>
         ${r.steps.map((s, i) => `
           <div class="step-row">
             <span class="step-num">${i + 1}</span>
             <span class="step-text">${escHtml(s)}</span>
           </div>`).join("")}
       </div>`
    : "";

  // ── Cultural context ──────────────────────────────────────────────────
  const hasCultural = r.origin || r.tradition || cc.story || cc.occasion || cc.variations;
  const culturalHTML = hasCultural
    ? `<div class="cultural-card">
         <h3>Cultural Context</h3>
         ${cc.story     ? `<p>${escHtml(cc.story)}</p>` : ""}
         ${r.tradition  ? `<p><strong>Tradition:</strong> ${escHtml(r.tradition)}</p>` : ""}
         ${r.origin     ? `<p><strong>Origin:</strong> ${escHtml(r.origin)}</p>` : ""}
         ${cc.occasion  ? `<p><strong>When it's eaten:</strong> ${escHtml(cc.occasion)}</p>` : ""}
         ${cc.variations? `<p><strong>Variations:</strong> ${escHtml(cc.variations)}</p>` : ""}
       </div>`
    : "";

  // ── Video ─────────────────────────────────────────────────────────────
  const embedUrl = getYouTubeEmbed(r.videoUrl);
  const videoHTML = embedUrl
    ? `<div class="video-box">
         <h3>Watch &amp; Learn</h3>
         <div class="video-wrapper">
           <iframe src="${embedUrl}" title="Recipe video" frameborder="0"
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
             allowfullscreen></iframe>
         </div>
       </div>`
    : "";

  // ── Render ────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="three-col">

      <aside class="col-left">
        ${photoHTML}
        ${photoHTML}
        ${photoHTML}
      </aside>

      <section class="col-centre">
        <h1 class="recipe-title">${escHtml(r.title || r.name || "Untitled")}</h1>
        ${r.authorName ? `<p class="recipe-author">By ${escHtml(r.authorName)}</p>` : ""}
        ${pillsHTML ? `<div class="pill-row">${pillsHTML}</div>` : ""}
        ${r.description ? `<p class="recipe-desc">${escHtml(r.description)}</p>` : ""}
        ${vaultBtn}
        ${ingredientsHTML}
        ${stepsHTML}
      </section>

      <aside class="col-right">
        ${culturalHTML}
        ${videoHTML}
      </aside>

    </div>`;

  // ── Vault button handler ──────────────────────────────────────────────
  const btn = document.getElementById("vault-btn");
  if (btn) {
    btn.addEventListener("click", async function () {
      if (!userId) { window.location.href = "Login.html"; return; }
      btn.disabled = true;
      btn.textContent = "Saving…";
      try {
        const res = await fetch(`${API_BASE}/api/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, recipeId: String(r.id) })
        });
        const data = await res.json();
        if (res.ok || data.message === "Already in favorites.") {
          btn.textContent = "Saved to Vault ✓";
          btn.classList.add("saved");
        } else {
          btn.disabled = false;
          btn.textContent = "+ Add to Meal Vault";
        }
      } catch {
        btn.disabled = false;
        btn.textContent = "+ Add to Meal Vault";
      }
    });
  }

  document.title = `${r.title || "Recipe"} — Dish Dash`;
}

window.addEventListener("DOMContentLoaded", loadDetail);

/* RecipeDetail.js — populates recipe-detail.html from localStorage */

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function starsHtml(rating) {
  const r = Math.round(Number(rating) || 0);
  return Array.from({ length: 5 }, (_, i) =>
    `<span style="color:${i < r ? "#ff8c42" : "#ddd"};font-size:1.1rem;">&#9733;</span>`
  ).join("");
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

  /* Photo */
  const photoSrc = r.imageUrl || "";
  const photoHTML = photoSrc
    ? `<img class="recipe-photo" src="${escHtml(photoSrc)}" alt="${escHtml(r.title)}" onerror="this.style.background='#f0f0f0';this.removeAttribute('src')">`
    : `<div class="recipe-photo"></div>`;

  /* Pills */
  const mealLabel = r.mealType || r.category || "";
  const pillsHTML = [
    mealLabel     ? `<span class="pill">${escHtml(mealLabel)}</span>` : "",
    r.cookingTime ? `<span class="pill">${escHtml(String(r.cookingTime))} min</span>` : "",
    r.difficulty  ? `<span class="pill">${escHtml(r.difficulty)}</span>` : "",
    ...(r.dietaryTags || []).filter(Boolean).map(t => `<span class="pill">${escHtml(t)}</span>`)
  ].filter(Boolean).join("");

  /* Action buttons */
  const actionHTML = isOwn
    ? `<div style="display:flex;gap:10px;margin:12px 0;">
         <button id="edit-recipe-btn" style="padding:8px 16px;background:#ff8c42;color:white;border:none;cursor:pointer;font-size:0.9rem;">Edit Recipe</button>
         <button id="delete-recipe-btn" style="padding:8px 16px;background:#cc3300;color:white;border:none;cursor:pointer;font-size:0.9rem;">Delete Recipe</button>
       </div>`
    : `<button id="vault-btn" class="btn-vault${alreadySaved ? " saved" : ""}" data-id="${r.id}" ${alreadySaved ? "disabled" : ""}>
         ${alreadySaved ? "Saved to Vault" : "+ Add to Meal Vault"}
       </button>`;

  /* Inline edit form (owner only) */
  const editFormHTML = isOwn ? `
    <div id="edit-form-section" style="display:none;margin-top:16px;padding:18px;background:#f9f9f9;border:1px solid #ddd;">
      <h3 style="margin-bottom:14px;">Edit Recipe</h3>
      <label style="display:block;margin-bottom:10px;">Title
        <input id="ef-title" value="${escHtml(r.title || "")}" style="display:block;width:100%;padding:8px;margin-top:4px;box-sizing:border-box;border:1px solid #ccc;">
      </label>
      <label style="display:block;margin-bottom:10px;">Description
        <textarea id="ef-desc" style="display:block;width:100%;padding:8px;margin-top:4px;box-sizing:border-box;border:1px solid #ccc;height:80px;">${escHtml(r.description || "")}</textarea>
      </label>
      <label style="display:block;margin-bottom:10px;">Image URL
        <input id="ef-image" value="${escHtml(r.imageUrl || "")}" style="display:block;width:100%;padding:8px;margin-top:4px;box-sizing:border-box;border:1px solid #ccc;">
      </label>
      <label style="display:block;margin-bottom:10px;">Cooking Time (mins)
        <input id="ef-time" type="number" value="${escHtml(String(r.cookingTime || ""))}" style="display:block;width:100%;padding:8px;margin-top:4px;box-sizing:border-box;border:1px solid #ccc;">
      </label>
      <label style="display:block;margin-bottom:10px;">Visibility
        <select id="ef-public" style="display:block;padding:8px;margin-top:4px;border:1px solid #ccc;">
          <option value="true" ${r.isPublic ? "selected" : ""}>Public</option>
          <option value="false" ${!r.isPublic ? "selected" : ""}>Private</option>
        </select>
      </label>
      <div style="display:flex;gap:10px;margin-top:12px;">
        <button id="save-edit-btn" style="padding:8px 16px;background:#ff8c42;color:white;border:none;cursor:pointer;">Save Changes</button>
        <button id="cancel-edit-btn" style="padding:8px 16px;background:#aaa;color:white;border:none;cursor:pointer;">Cancel</button>
      </div>
      <p id="edit-msg" style="margin-top:8px;color:#cc3300;"></p>
    </div>` : "";

  /* Ingredients */
  const ingredientsHTML = (r.ingredients && r.ingredients.length)
    ? `<div class="ingredients-box">
         <h3 class="box-heading">Ingredients</h3>
         ${r.ingredients.map(i => `<div class="ingredient-row">${escHtml(i)}</div>`).join("")}
       </div>` : "";

  /* Steps */
  const stepsHTML = (r.steps && r.steps.length)
    ? `<div class="steps-box">
         <h3 class="box-heading">Instructions</h3>
         ${r.steps.map((s, i) => `
           <div class="step-row">
             <span class="step-num">${i + 1}</span>
             <span class="step-text">${escHtml(s)}</span>
           </div>`).join("")}
       </div>` : "";

  /* Cultural context */
  const hasCultural = r.origin || r.tradition || cc.story || cc.occasion || cc.variations;
  const culturalHTML = hasCultural
    ? `<div class="cultural-card">
         <h3>Cultural Context</h3>
         ${cc.story     ? `<p>${escHtml(cc.story)}</p>` : ""}
         ${r.tradition  ? `<p><strong>Tradition:</strong> ${escHtml(r.tradition)}</p>` : ""}
         ${r.origin     ? `<p><strong>Origin:</strong> ${escHtml(r.origin)}</p>` : ""}
         ${cc.occasion  ? `<p><strong>When it is eaten:</strong> ${escHtml(cc.occasion)}</p>` : ""}
         ${cc.variations? `<p><strong>Variations:</strong> ${escHtml(cc.variations)}</p>` : ""}
       </div>` : "";

  /* Review submission form (non-owners only) */
  const reviewFormHTML = (userId && !isOwn)
    ? `<div id="review-form" style="margin-top:20px;padding:16px;background:#f9f9f9;border:1px solid #eee;">
         <h4 style="margin-bottom:10px;">Leave a Review</h4>
         <div style="margin-bottom:10px;">
           <span style="margin-right:6px;">Rating:</span>
           ${[1,2,3,4,5].map(n =>
             `<label style="cursor:pointer;font-size:1.3rem;color:#ff8c42;margin-right:4px;">
                <input type="radio" name="review-rating" value="${n}" style="display:none;">${n}&#9733;
              </label>`
           ).join("")}
         </div>
         <textarea id="review-comment" placeholder="Write your review..." style="display:block;width:100%;padding:8px;box-sizing:border-box;border:1px solid #ccc;height:70px;margin-bottom:8px;"></textarea>
         <button id="submit-review-btn" style="padding:8px 16px;background:#ff8c42;color:white;border:none;cursor:pointer;">Submit Review</button>
         <p id="review-form-msg" style="margin-top:6px;"></p>
       </div>` : "";

  /* Build page */
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
        ${actionHTML}
        ${editFormHTML}
        ${ingredientsHTML}
        ${stepsHTML}
        <div id="reviews-section" style="margin-top:30px;">
          <p style="color:#999;">Loading reviews...</p>
        </div>
        ${reviewFormHTML}
      </section>
      <aside class="col-right">
        ${culturalHTML}
      </aside>
    </div>`;

  /* Vault button */
  const vaultBtn = document.getElementById("vault-btn");
  if (vaultBtn) {
    vaultBtn.addEventListener("click", async function () {
      if (!userId) { window.location.href = "Login.html"; return; }
      vaultBtn.disabled = true;
      vaultBtn.textContent = "Saving...";
      try {
        const res = await fetch(`${API_BASE}/api/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, recipeId: String(r.id) })
        });
        const data = await res.json();
        if (res.ok || data.message === "Already in favorites.") {
          vaultBtn.textContent = "Saved to Vault";
          vaultBtn.classList.add("saved");
        } else {
          vaultBtn.disabled = false;
          vaultBtn.textContent = "+ Add to Meal Vault";
        }
      } catch {
        vaultBtn.disabled = false;
        vaultBtn.textContent = "+ Add to Meal Vault";
      }
    });
  }

  /* Delete recipe */
  const deleteRecipeBtn = document.getElementById("delete-recipe-btn");
  if (deleteRecipeBtn) {
    deleteRecipeBtn.addEventListener("click", async function () {
      if (!confirm("Delete this recipe? This cannot be undone.")) return;
      deleteRecipeBtn.disabled = true;
      try {
        const res = await fetch(`${API_BASE}/api/recipes/${r.id}`, {
          method: "DELETE",
          headers: { "x-user-id": userId }
        });
        if (res.ok) {
          alert("Recipe deleted.");
          window.location.href = "Dish-Dash.html";
        } else {
          const d = await res.json();
          alert(d.message || "Failed to delete.");
          deleteRecipeBtn.disabled = false;
        }
      } catch {
        alert("Error deleting recipe.");
        deleteRecipeBtn.disabled = false;
      }
    });
  }

  /* Edit recipe */
  const editRecipeBtn = document.getElementById("edit-recipe-btn");
  const editFormSection = document.getElementById("edit-form-section");
  if (editRecipeBtn && editFormSection) {
    editRecipeBtn.addEventListener("click", () => {
      editFormSection.style.display = editFormSection.style.display === "none" ? "block" : "none";
    });
    document.getElementById("cancel-edit-btn").addEventListener("click", () => {
      editFormSection.style.display = "none";
    });
    document.getElementById("save-edit-btn").addEventListener("click", async function () {
      const saveBtn = this;
      const msg = document.getElementById("edit-msg");
      msg.textContent = "";
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";
      const body = {
        title: document.getElementById("ef-title").value.trim(),
        description: document.getElementById("ef-desc").value.trim(),
        imageUrl: document.getElementById("ef-image").value.trim(),
        cookingTime: parseInt(document.getElementById("ef-time").value) || null,
        isPublic: document.getElementById("ef-public").value === "true"
      };
      if (!body.title) {
        msg.textContent = "Title is required.";
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Changes";
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/recipes/${r.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "x-user-id": userId },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("selectedRecipe", JSON.stringify(data));
          alert("Recipe updated! Reloading...");
          window.location.reload();
        } else {
          msg.textContent = data.message || "Failed to save.";
          saveBtn.disabled = false;
          saveBtn.textContent = "Save Changes";
        }
      } catch {
        msg.textContent = "Error saving changes.";
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Changes";
      }
    });
  }

  /* Load reviews */
  await loadReviews(r.id, userId);

  /* Submit review */
  const submitReviewBtn = document.getElementById("submit-review-btn");
  if (submitReviewBtn) {
    submitReviewBtn.addEventListener("click", async function () {
      const ratingInput = document.querySelector("input[name='review-rating']:checked");
      const comment = document.getElementById("review-comment").value.trim();
      const msg = document.getElementById("review-form-msg");
      if (!ratingInput) { msg.style.color = "#cc3300"; msg.textContent = "Please select a rating."; return; }
      submitReviewBtn.disabled = true;
      try {
        const res = await fetch(`${API_BASE}/api/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId: String(r.id), userId, rating: Number(ratingInput.value), comment })
        });
        const data = await res.json();
        if (res.ok) {
          document.getElementById("review-comment").value = "";
          document.querySelectorAll("input[name='review-rating']").forEach(i => { i.checked = false; });
          msg.style.color = "green";
          msg.textContent = "Review submitted!";
          await loadReviews(r.id, userId);
          setTimeout(() => { msg.textContent = ""; }, 3000);
        } else {
          msg.style.color = "#cc3300";
          msg.textContent = data.message || "Failed to submit.";
          submitReviewBtn.disabled = false;
        }
      } catch {
        msg.style.color = "#cc3300";
        msg.textContent = "Error submitting review.";
        submitReviewBtn.disabled = false;
      }
    });
  }

  document.title = `${r.title || "Recipe"} — Dish Dash`;
}

async function loadReviews(recipeId, userId) {
  const section = document.getElementById("reviews-section");
  if (!section) return;

  let reviews = [];
  try {
    const res = await fetch(`${API_BASE}/api/reviews/recipe/${recipeId}`);
    reviews = res.ok ? await res.json() : [];
  } catch { reviews = []; }

  if (!reviews.length) {
    section.innerHTML = `<h3 style="margin-bottom:8px;">Reviews</h3><p style="color:#999;">No reviews yet.</p>`;
    return;
  }

  const avg = (reviews.reduce((sum, rv) => sum + Number(rv.rating || 0), 0) / reviews.length).toFixed(1);

  section.innerHTML = `
    <h3 style="margin-bottom:10px;">Reviews</h3>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
      ${starsHtml(Math.round(avg))}
      <span style="font-size:1.2rem;font-weight:bold;">${avg}</span>
      <span style="color:#999;font-size:0.9rem;">(${reviews.length} review${reviews.length !== 1 ? "s" : ""})</span>
    </div>
    ${reviews.map(rv => `
      <div class="review-card" data-review-id="${rv.id}" style="padding:12px;border:1px solid #eee;margin-bottom:10px;background:#fff;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
          ${starsHtml(rv.rating)}
          <span style="font-size:0.8rem;color:#999;">${new Date(rv.createdAt).toLocaleDateString()}</span>
          ${String(rv.userId) === String(userId) ? `<button onclick="deleteReview('${rv.id}')" style="margin-left:auto;padding:3px 10px;background:#cc3300;color:white;border:none;cursor:pointer;font-size:0.75rem;">Delete</button>` : ""}
        </div>
        ${rv.comment ? `<p style="margin:0;color:#333;">${escHtml(rv.comment)}</p>` : ""}
      </div>`
    ).join("")}`;
}

async function deleteReview(reviewId) {
  const userId = localStorage.getItem("userId");
  if (!userId) { window.location.href = "Login.html"; return; }
  if (!confirm("Delete this review?")) return;
  try {
    const res = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    if (res.ok) {
      const stored = localStorage.getItem("selectedRecipe");
      if (stored) {
        const r = JSON.parse(stored);
        await loadReviews(r.id, userId);
      }
    } else {
      alert("Failed to delete review.");
    }
  } catch {
    alert("Error deleting review.");
  }
}

window.addEventListener("DOMContentLoaded", loadDetail);

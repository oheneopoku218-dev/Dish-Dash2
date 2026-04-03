function getYouTubeEmbed(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return url; // treat as direct video URL
}

async function displayRecipeDetail() {
  const container = document.getElementById("recipe-detail");
  if (!container) return;

  const stored = localStorage.getItem("selectedRecipe");
  if (!stored) {
    container.innerHTML = "<p>No recipe selected. <a href='Dish-Dash.html'>Go back</a></p>";
    return;
  }

  const r = JSON.parse(stored);
  const cc = r.culturalContext || {};
  const embedUrl = getYouTubeEmbed(r.videoUrl);
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

  container.innerHTML = `
    <button onclick="window.history.back()" style="margin-bottom:20px;cursor:pointer;">← Back</button>
    ${!isOwn ? `<button id="save-to-box-btn" style="float:right;padding:9px 18px;background:${alreadySaved ? '#ccc' : '#ff8c42'};color:white;border:none;border-radius:8px;cursor:${alreadySaved ? 'default' : 'pointer'};font-size:0.9rem;" ${alreadySaved ? 'disabled' : ''}>${alreadySaved ? 'Saved ✓' : 'Save to Recipe Box'}</button>` : ''}

    ${r.imageUrl ? `<img src="${r.imageUrl}" alt="${r.title}" style="width:100%;max-height:350px;object-fit:cover;border-radius:12px;margin-bottom:20px;" onerror="this.style.display='none'">` : ""}

    <h2>${r.title || r.name || "Untitled Recipe"}</h2>
    <p style="color:#666;">${r.category || r.mealType || ""} ${r.authorName ? "· by " + r.authorName : ""}</p>

    ${r.description ? `<p style="margin:16px 0;">${r.description}</p>` : ""}

    <div style="display:flex;gap:16px;margin:16px 0;flex-wrap:wrap;">
      ${r.cookingTime ? `<span><strong>Time:</strong> ${r.cookingTime} mins</span>` : ""}
      ${r.difficulty ? `<span><strong>Difficulty:</strong> ${r.difficulty}</span>` : ""}
      ${r.dietaryTags?.length ? `<span><strong>Tags:</strong> ${r.dietaryTags.join(", ")}</span>` : ""}
    </div>

    ${r.ingredients?.length ? `
      <h3>Ingredients</h3>
      <ul>${r.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
    ` : ""}

    ${r.steps?.length ? `
      <h3>Steps</h3>
      <ol>${r.steps.map(s => `<li>${s}</li>`).join("")}</ol>
    ` : ""}

    ${embedUrl ? `
      <h3 style="margin-top:24px;">Video</h3>
      ${embedUrl.includes("youtube.com/embed") ? `
        <iframe src="${embedUrl}" width="100%" height="360" frameborder="0" allowfullscreen
          style="border-radius:12px;margin-top:8px;"></iframe>
      ` : `
        <video controls src="${embedUrl}" style="width:100%;border-radius:12px;margin-top:8px;"></video>
      `}
    ` : ""}

    ${(cc.story || cc.occasion || cc.variations) ? `
      <div style="margin-top:32px;padding:24px;background:#fff8f3;border-left:4px solid #ff8c42;border-radius:8px;">
        <h3 style="color:#ff8c42;margin-bottom:12px;">Cultural Context</h3>
        ${cc.story ? `<p><strong>Story:</strong> ${cc.story}</p>` : ""}
        ${cc.occasion ? `<p><strong>When eaten:</strong> ${cc.occasion}</p>` : ""}
        ${cc.variations ? `<p><strong>Regional variations:</strong> ${cc.variations}</p>` : ""}
      </div>
    ` : ""}

    <!-- Reviews -->
    <div id="reviews-section" style="margin-top:40px;">
      <h3>Reviews</h3>
      <div id="reviews-list"><p style="color:#999;">Loading reviews...</p></div>

      <div id="review-form-wrapper" style="margin-top:24px;padding:20px;background:#f9f9f9;border-radius:12px;">
        <h4>Leave a Review</h4>
        <div style="margin:12px 0;">
          <label>Rating</label><br>
          <select id="review-rating" style="margin-top:6px;padding:8px;border-radius:6px;border:1px solid #ddd;">
            <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
            <option value="4">⭐⭐⭐⭐ 4 - Great</option>
            <option value="3">⭐⭐⭐ 3 - Good</option>
            <option value="2">⭐⭐ 2 - Fair</option>
            <option value="1">⭐ 1 - Poor</option>
          </select>
        </div>
        <div style="margin:12px 0;">
          <label>Comment</label><br>
          <textarea id="review-comment" placeholder="Share your thoughts..." rows="3"
            style="width:100%;margin-top:6px;padding:10px;border-radius:6px;border:1px solid #ddd;resize:vertical;box-sizing:border-box;"></textarea>
        </div>
        <button id="submit-review-btn"
          style="background:#ff8c42;color:white;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:1rem;">
          Submit Review
        </button>
        <p id="review-error" style="color:red;margin-top:8px;"></p>
      </div>
    </div>
  `;

  loadReviews(r.id);
  setupReviewForm(r.id);
}

async function loadReviews(recipeId) {
  const list = document.getElementById("reviews-list");
  if (!list || !recipeId) return;

  try {
    const res = await fetch(`${API_BASE}/api/reviews/recipe/${recipeId}`);
    const reviews = await res.json();

    if (!reviews.length) {
      list.innerHTML = "<p style='color:#999;'>No reviews yet. Be the first!</p>";
      return;
    }

    const avg = reviews.reduce((sum, rv) => sum + rv.rating, 0) / reviews.length;
    const avgStars = '⭐'.repeat(Math.round(avg));
    const avgHTML = '<div style="padding:12px 16px;background:#fff8f3;border-radius:8px;margin-bottom:16px;display:flex;align-items:center;gap:12px;">'
      + '<span style="font-size:1.5rem;font-weight:700;color:#ff8c42;">' + avg.toFixed(1) + '</span>'
      + '<div><div style="font-size:1.1rem;">' + avgStars + '</div>'
      + '<div style="color:#888;font-size:0.82rem;">' + reviews.length + ' review' + (reviews.length !== 1 ? 's' : '') + '</div></div>'
      + '</div>';

    list.innerHTML = avgHTML + reviews.map(rv => `
      <div style="padding:16px;border-bottom:1px solid #eee;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span>${"⭐".repeat(rv.rating)}</span>
          <span style="color:#999;font-size:0.8rem;">${new Date(rv.createdAt).toLocaleDateString()}</span>
        </div>
        ${rv.comment ? `<p style="margin:0;">${rv.comment}</p>` : ""}
      </div>
    `).join("");
  } catch (err) {
    list.innerHTML = "<p style='color:#999;'>Could not load reviews.</p>";
  }
}

function setupReviewForm(recipeId) {
  const btn = document.getElementById("submit-review-btn");
  const errorBox = document.getElementById("review-error");
  if (!btn) return;

  const userId = localStorage.getItem("userId");
  if (!userId) {
    document.getElementById("review-form-wrapper").innerHTML =
      `<p><a href="Login.html">Log in</a> to leave a review.</p>`;
    return;
  }

  btn.addEventListener("click", async () => {
    errorBox.textContent = "";
    const rating = Number(document.getElementById("review-rating").value);
    const comment = document.getElementById("review-comment").value.trim();

    try {
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId, userId, rating, comment })
      });

      const data = await res.json();
      if (!res.ok) { errorBox.textContent = data.message || "Failed to submit."; return; }

      document.getElementById("review-comment").value = "";
      loadReviews(recipeId);
    } catch (err) {
      errorBox.textContent = "Server error. Try again.";
    }
  });
}

window.onload = displayRecipeDetail;

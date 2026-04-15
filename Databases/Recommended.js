/* Recommended.js — shows recipes on the home page, with localStorage caching */

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function openRecipe(recipe) {
  localStorage.setItem("selectedRecipe", JSON.stringify(recipe));
  window.location.href = "recipe-detail.html";
}

document.addEventListener("DOMContentLoaded", async function () {
  var grid = document.getElementById("recommended-grid");
  if (!grid) return;

  var all = [];

  /* Try fetching from the server */
  try {
    var res = await fetch(API_BASE + "/api/recipes");
    if (!res.ok) throw new Error("fetch failed");
    all = await res.json();
    /* Save to localStorage so the page works after refresh */
    localStorage.setItem("cachedAllRecipes", JSON.stringify(all));
  } catch (err) {
    /* Server not available — load from cache */
    var cached = localStorage.getItem("cachedAllRecipes");
    if (cached) {
      all = JSON.parse(cached);
    }
  }

  var publicRecipes = all.filter(function (r) { return r.isPublic; });

  if (!publicRecipes.length) {
    grid.innerHTML = '<p class="rec-empty">No recipes yet — be the first to add one!</p>';
    return;
  }

  /* itz.oxene's recipes always get the first slots */
  var featured  = shuffle(publicRecipes.filter(function (r) { return r.authorName === "itz.oxene"; })).slice(0, 3);
  var others    = shuffle(publicRecipes.filter(function (r) { return r.authorName !== "itz.oxene"; }));
  var picks     = featured.concat(others).slice(0, 6);

  grid.innerHTML = picks.map(function (r) {
    var label = r.mealType || r.category || "";
    if (label.toLowerCase() === "desert") label = "Dessert";
    var isFeatured = r.authorName === "itz.oxene";

    var imgHTML = r.imageUrl
      ? '<img src="' + escHtml(r.imageUrl) + '" alt="' + escHtml(r.title) + '" onerror="this.outerHTML=\'<div class=rec-img-placeholder></div>\'">'
      : '<div class="rec-img-placeholder"></div>';

    var featuredBadge = isFeatured
      ? '<div style="position:absolute;top:8px;left:8px;background:linear-gradient(135deg,#FFD700,#FFA500);color:#000;font-size:0.7rem;font-weight:800;padding:3px 9px;letter-spacing:0.05em;z-index:1;">★ FEATURED</div>'
      : "";

    return (
      '<div class="rec-card" onclick=\'openRecipe(' + JSON.stringify(r).replace(/'/g, "&#39;") + ")\'" +
        ' style="position:relative;' + (isFeatured ? "border:2px solid #FFD700;box-shadow:0 0 12px rgba(255,215,0,0.35);" : "") + '">' +
        featuredBadge +
        imgHTML +
        '<div class="rec-card-body">' +
          '<p class="rec-card-name">' + escHtml(r.title || "Untitled") + "</p>" +
          '<div class="rec-card-meta">' +
            (label ? '<span class="rec-tag-meal">' + escHtml(label) + "</span>" : "") +
            (r.cookingTime ? '<span class="rec-tag-time">' + escHtml(String(r.cookingTime)) + " min</span>" : "") +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }).join("");
});

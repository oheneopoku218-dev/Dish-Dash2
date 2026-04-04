/* FavoriteUPD.js — pill-filter favourites page */

var _favRecipes   = [];
var _activeFilter = "all";

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── Pill filter wiring ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".pill-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".pill-btn").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      _activeFilter = btn.getAttribute("data-filter");
      renderGrid();
    });
  });
});

// ── Render the grid ─────────────────────────────────────────────────────
function renderGrid() {
  var container = document.getElementById("favorites-container");
  if (!container) return;

  var filtered = _favRecipes.filter(function (r) {
    if (_activeFilter === "all") return true;
    var cat = (r.category || r.mealType || "").toLowerCase();
    if (cat === "desert") cat = "dessert";
    return cat === _activeFilter;
  });

  if (!filtered.length) {
    container.innerHTML =
      '<div class="empty-state" style="grid-column:1/-1">' +
        '<span class="icon">🍽️</span>' +
        "<p>No favourites in this category.</p>" +
        '<p><a href="Dish-Dash.html">Browse recipes</a></p>' +
      "</div>";
    return;
  }

  container.innerHTML = filtered.map(function (r) {
    var label = r.mealType || r.category || "";
    if (label.toLowerCase() === "desert") label = "Dessert";

    var imgHTML = r.imageUrl
      ? '<img src="' + escHtml(r.imageUrl) + '" alt="' + escHtml(r.title) + '" onerror="this.outerHTML=\'<div class=fav-card-img-placeholder></div>\'">'
      : '<div class="fav-card-img-placeholder"></div>';

    var timeHTML = r.cookingTime
      ? '<span class="tag-time">⏱ ' + escHtml(String(r.cookingTime)) + " min</span>"
      : "";

    return (
      '<div class="fav-card" onclick=\'openRecipe(' + JSON.stringify(r).replace(/'/g, "&#39;") + ")\'>" +
        imgHTML +
        '<div class="fav-card-body">' +
          '<p class="fav-card-name">' + escHtml(r.title || r.name || "Untitled") + "</p>" +
          '<div class="fav-card-meta">' +
            (label ? '<span class="tag-meal">' + escHtml(label) + "</span>" : "") +
            timeHTML +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }).join("");
}

function openRecipe(recipe) {
  localStorage.setItem("selectedRecipe", JSON.stringify(recipe));
  window.location.href = "recipe-detail.html";
}

// ── Load on page ready ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async function () {
  var container = document.getElementById("favorites-container");
  var userId = localStorage.getItem("userId");

  if (!userId) {
    window.location.href = "Login.html";
    return;
  }

  try {
    var favRes = await fetch(API_BASE + "/api/favorites/user/" + userId, {
      headers: { "x-user-id": userId }
    });
    if (!favRes.ok) throw new Error("favorites fetch failed");
    var favorites = await favRes.json();

    if (!favorites.length) {
      container.innerHTML =
        '<div class="empty-state">' +
          '<span class="icon">🤍</span>' +
          "<p>You haven't saved any favourites yet.</p>" +
          '<p><a href="Dish-Dash.html">Explore recipes</a> and hit Save to Recipe Box!</p>' +
        "</div>";
      return;
    }

    var recipeRes = await fetch(API_BASE + "/api/recipes", {
      headers: { "x-user-id": userId }
    });
    var allRecipes = recipeRes.ok ? await recipeRes.json() : [];
    var recipeMap = {};
    allRecipes.forEach(function (r) { recipeMap[String(r.id)] = r; });

    _favRecipes = favorites
      .map(function (fav) { return recipeMap[String(fav.recipeId)]; })
      .filter(Boolean);

    if (!_favRecipes.length) {
      container.innerHTML =
        '<div class="empty-state">' +
          '<span class="icon">🤍</span>' +
          "<p>Could not load your favourites.</p>" +
          '<p><a href="Dish-Dash.html">Go back home</a></p>' +
        "</div>";
      return;
    }

    renderGrid();

  } catch (err) {
    console.error("Favourites load error:", err);
    container.innerHTML = '<p class="loading-msg" style="color:#cc0000;">Error loading favourites. Please try again.</p>';
  }
});

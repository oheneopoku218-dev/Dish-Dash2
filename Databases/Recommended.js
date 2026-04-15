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
  // ---- RECIPE OF THE DAY ----
  try {
    var rotdRes = await fetch(API_BASE + "/api/admin/rotd");
    if (rotdRes.ok) {
      var rotd = await rotdRes.json();
      if (rotd && rotd.id) {
        var rotdSection = document.getElementById("rotd-section");
        var rotdCard    = document.getElementById("rotd-card");
        if (rotdSection && rotdCard) {
          rotdSection.style.display = "block";
          rotdCard.innerHTML =
            '<div style="background:#fff;border:2px solid #FFD700;box-shadow:0 0 20px rgba(255,215,0,0.25);' +
            'display:flex;gap:0;overflow:hidden;cursor:pointer;" ' +
            'onclick=\'openRecipe(' + JSON.stringify(rotd).replace(/'/g, "&#39;") + ')\'>' +
              (rotd.imageUrl
                ? '<img src="' + escHtml(rotd.imageUrl) + '" alt="' + escHtml(rotd.title) + '" ' +
                  'style="width:280px;max-width:38%;object-fit:cover;flex-shrink:0;" onerror="this.style.display=\'none\'">'
                : '') +
              '<div style="padding:24px 28px;display:flex;flex-direction:column;justify-content:center;">' +
                '<div style="display:inline-block;background:linear-gradient(135deg,#FFD700,#FFA500);color:#000;' +
                'font-size:0.72rem;font-weight:800;padding:4px 12px;letter-spacing:0.06em;margin-bottom:10px;width:fit-content;">⭐ RECIPE OF THE DAY</div>' +
                '<h2 style="margin:0 0 8px;font-size:1.4rem;color:#1a1a1a;">' + escHtml(rotd.title || "Untitled") + '</h2>' +
                (rotd.description ? '<p style="color:#666;font-size:0.92rem;margin:0 0 12px;line-height:1.5;">' + escHtml(rotd.description) + '</p>' : '') +
                '<div style="display:flex;gap:12px;flex-wrap:wrap;">' +
                  (rotd.category ? '<span style="background:#fff8f3;border:1px solid #ffe0c0;color:#ff8c42;font-size:0.78rem;font-weight:700;padding:3px 10px;text-transform:capitalize;">' + escHtml(rotd.category) + '</span>' : '') +
                  (rotd.cookingTime ? '<span style="background:#f5f5f5;color:#666;font-size:0.78rem;padding:3px 10px;">⏱ ' + escHtml(String(rotd.cookingTime)) + ' min</span>' : '') +
                  (rotd.difficulty ? '<span style="background:#f5f5f5;color:#666;font-size:0.78rem;padding:3px 10px;">📊 ' + escHtml(rotd.difficulty) + '</span>' : '') +
                '</div>' +
              '</div>' +
            '</div>';
        }
      }
    }
  } catch {}

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

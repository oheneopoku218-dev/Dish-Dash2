/* Recommended.js — random public recipes on the home page */

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

  try {
    var res = await fetch(API_BASE + "/api/recipes");
    if (!res.ok) throw new Error("fetch failed");
    var all = await res.json();

    var public_ = all.filter(function (r) { return r.isPublic; });
    if (!public_.length) {
      grid.innerHTML = '<p class="rec-empty">No recipes yet — be the first to add one!</p>';
      return;
    }

    var picks = shuffle(public_).slice(0, 9);

    grid.innerHTML = picks.map(function (r) {
      var label = r.mealType || r.category || "";
      if (label.toLowerCase() === "desert") label = "Dessert";

      var imgHTML = r.imageUrl
        ? '<img src="' + escHtml(r.imageUrl) + '" alt="' + escHtml(r.title) + '" onerror="this.outerHTML=\'<div class=rec-img-placeholder></div>\'">'
        : '<div class="rec-img-placeholder"></div>';

      return (
        '<div class="rec-card" onclick=\'openRecipe(' + JSON.stringify(r).replace(/'/g, "&#39;") + ")\'>" +
          imgHTML +
          '<div class="rec-card-body">' +
            '<p class="rec-card-name">' + escHtml(r.title || "Untitled") + "</p>" +
            '<div class="rec-card-meta">' +
              (label ? '<span class="rec-tag-meal">' + escHtml(label) + "</span>" : "") +
              (r.cookingTime ? '<span class="rec-tag-time">⏱ ' + escHtml(String(r.cookingTime)) + " min</span>" : "") +
            "</div>" +
          "</div>" +
        "</div>"
      );
    }).join("");

  } catch (err) {
    console.error("Recommended load error:", err);
    grid.innerHTML = "";
  }
});

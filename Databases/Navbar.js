// ---- AUTH LINK + ADMIN PANEL ----
document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  const userId   = localStorage.getItem("userId");
  const authLink = document.getElementById("auth-link");
  if (authLink) {
    if (username) {
      authLink.textContent = "My Account";
      authLink.href = "account.html";
    } else {
      authLink.textContent = "Login / Sign Up";
      authLink.href = "Login.html";
    }
  }

  /* Admin panel button — only for itz.oxene */
  if (username !== "itz.oxene") return;

  /* Inject button into navbar */
  const nav = document.querySelector("header.navbar nav");
  if (nav) {
    const adminBtn = document.createElement("button");
    adminBtn.textContent = "Admin";
    adminBtn.style.cssText =
      "background:linear-gradient(135deg,#FFD700,#FFA500);color:#000;border:none;" +
      "padding:6px 14px;font-weight:800;font-size:0.85rem;cursor:pointer;" +
      "letter-spacing:0.04em;margin-left:8px;font-family:inherit;";
    adminBtn.addEventListener("click", openAdminPanel);
    nav.appendChild(adminBtn);
  }

  /* Build and inject the overlay */
  const overlay = document.createElement("div");
  overlay.id = "admin-overlay";
  overlay.style.cssText =
    "display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;justify-content:center;align-items:center;";
  overlay.innerHTML =
    '<div style="background:#fff;width:90%;max-width:520px;padding:32px 28px;position:relative;font-family:inherit;">' +
      '<button onclick="document.getElementById(\'admin-overlay\').style.display=\'none\'" ' +
        'style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:1.4rem;cursor:pointer;color:#999;">&times;</button>' +
      '<h2 style="margin:0 0 4px;color:#ff8c42;">Admin Dashboard</h2>' +
      '<p style="color:#999;font-size:0.85rem;margin:0 0 20px;">Logged in as <strong>itz.oxene</strong></p>' +
      '<div id="admin-stats-body" style="color:#555;font-size:0.95rem;">Loading...</div>' +
    '</div>';
  document.body.appendChild(overlay);

  /* Click outside to close */
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) overlay.style.display = "none";
  });
});

async function openAdminPanel() {
  const overlay = document.getElementById("admin-overlay");
  const body    = document.getElementById("admin-stats-body");
  if (!overlay || !body) return;
  overlay.style.display = "flex";
  body.innerHTML = "Loading...";

  try {
    const userId = localStorage.getItem("userId");
    const res = await fetch(API_BASE + "/api/admin/stats", {
      headers: { "x-user-id": userId }
    });
    const d = await res.json();
    if (!res.ok) { body.innerHTML = "<p style='color:#cc3300;'>" + (d.message || "Error") + "</p>"; return; }

    const catRows = Object.entries(d.byCategory || {})
      .sort((a, b) => b[1] - a[1])
      .map(([cat, n]) =>
        '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0f0f0;">' +
          '<span style="text-transform:capitalize;">' + cat + '</span>' +
          '<strong>' + n + '</strong>' +
        '</div>'
      ).join("");

    body.innerHTML =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">' +
        stat("Total Recipes",   d.totalRecipes)   +
        stat("Public",          d.publicRecipes)  +
        stat("Private",         d.privateRecipes) +
        stat("Total Users",     d.totalUsers)     +
        stat("Reviews",         d.totalReviews)   +
        stat("Recipe Box Saves",d.totalFavorites) +
      '</div>' +
      '<h4 style="margin:0 0 8px;color:#ff8c42;">Recipes by Category</h4>' +
      '<div>' + (catRows || '<p style="color:#999;">No data</p>') + '</div>';
  } catch (err) {
    body.innerHTML = "<p style='color:#cc3300;'>Could not load stats.</p>";
  }
}

function stat(label, value) {
  return '<div style="background:#fff8f3;border:1px solid #ffe0c0;padding:14px 16px;">' +
    '<div style="font-size:1.6rem;font-weight:800;color:#ff8c42;">' + (value ?? "—") + '</div>' +
    '<div style="font-size:0.8rem;color:#888;margin-top:2px;">' + label + '</div>' +
  '</div>';
}

// ---- SEARCH ----
const searchInput = document.getElementById("search-bar");
if (searchInput) {
  const resultsBox = document.createElement("div");
  resultsBox.id = "search-results";
  resultsBox.style.cssText =
    "position:absolute;top:100%;left:0;right:0;" +
    "background:white;border:1px solid #e0e0e0;" +
    "max-height:300px;overflow-y:auto;z-index:1000;display:none;";

  const searchContainer = searchInput.parentElement;
  searchContainer.style.position = "relative";
  searchContainer.appendChild(resultsBox);

  let allRecipes = [];
  let currentMatches = [];

  async function fetchRecipes() {
    try {
      const userId = localStorage.getItem("userId");
      const headers = userId ? { "x-user-id": userId } : {};
      const res = await fetch(API_BASE + "/api/recipes", { headers });
      allRecipes = res.ok ? await res.json() : [];
      localStorage.setItem("cachedAllRecipes", JSON.stringify(allRecipes));
    } catch (e) {
      const cached = localStorage.getItem("cachedAllRecipes");
      allRecipes = cached ? JSON.parse(cached) : [];
    }
  }
  fetchRecipes();

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) { resultsBox.style.display = "none"; return; }

    currentMatches = allRecipes.filter(r => {
      const inTitle      = (r.title || "").toLowerCase().includes(query);
      const inCategory   = (r.category || "").toLowerCase().includes(query);
      const inIngredient = Array.isArray(r.ingredients) &&
        r.ingredients.some(i => (i || "").toLowerCase().includes(query));
      return inTitle || inCategory || inIngredient;
    });

    if (!currentMatches.length) {
      resultsBox.innerHTML =
        '<div style="padding:10px 14px;color:#999;font-size:0.9rem;">No results found</div>';
    } else {
      resultsBox.innerHTML = currentMatches.map((r, i) =>
        '<div data-idx="' + i + '" style="padding:10px 14px;cursor:pointer;' +
        'border-bottom:1px solid #f0f0f0;font-size:0.9rem;">' +
          '<strong>' + (r.title || "Untitled") + '</strong>' +
          '<span style="color:#ff8c42;font-size:0.8rem;margin-left:8px;">' +
            (r.category || "") +
          '</span>' +
        '</div>'
      ).join("");

      resultsBox.querySelectorAll("[data-idx]").forEach(function (el) {
        el.addEventListener("click", function () {
          var recipe = currentMatches[Number(el.getAttribute("data-idx"))];
          localStorage.setItem("selectedRecipe", JSON.stringify(recipe));
          window.location.href = "recipe-detail.html";
          resultsBox.style.display = "none";
        });
      });
    }

    resultsBox.style.display = "block";
  });

  document.addEventListener("click", function (e) {
    if (!searchContainer.contains(e.target)) {
      resultsBox.style.display = "none";
    }
  });
}

// ---- AUTH LINK ----
document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  const authLink = document.getElementById("auth-link");
  if (!authLink) return;

  if (username) {
    authLink.textContent = "My Account";
    authLink.href = "account.html";
  } else {
    authLink.textContent = "Login / Sign Up";
    authLink.href = "Login.html";
  }
});

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

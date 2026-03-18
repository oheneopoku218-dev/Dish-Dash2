// Safely get elements
const searchcontainer = document.getElementById("search-container");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const filterContainer = document.getElementById("filter-container");

// -----------------------------
// SAFE FETCH FUNCTION
// -----------------------------
async function fetchRecipes(query = "") {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=YOUR_API_KEY`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
}

// -----------------------------
// RANDOM RECIPES
// -----------------------------
async function showRandomRecipes() {
  if (!searchResults) return;

  const recipes = await fetchRecipes("");
  const random = recipes.sort(() => 0.5 - Math.random()).slice(0, 10);

  searchResults.innerHTML = random
    .map(
      (item) =>
        `<div class="search-item" data-page="${item.page || "#"}">${item.title}</div>`
    )
    .join("");

  searchResults.style.display = "block";
}

// -----------------------------
// ONLY RUN IF SEARCH BAR EXISTS
// -----------------------------
if (searchInput && searchcontainer && searchResults) {
  // Expand search on focus
  searchInput.addEventListener("focus", () => {
    searchcontainer.classList.add("expanded");
    if (filterContainer) filterContainer.style.display = "flex";
    showRandomRecipes();
  });

  // Collapse search when clicking outside
  document.addEventListener("click", (e) => {
    if (!searchcontainer.contains(e.target)) {
      searchcontainer.classList.remove("expanded");
      if (filterContainer) filterContainer.style.display = "none";
      searchResults.style.display = "none";
    }
  });

  // Live search
  searchInput.addEventListener("input", async function () {
    const query = searchInput.value.trim().toLowerCase();
    const recipes = await fetchRecipes(query);

    const selectedFilters = [
      ...document.querySelectorAll(".filter-checkbox:checked"),
    ].map((cb) => cb.value);

    let matches = recipes;

    if (query !== "") {
      matches = matches.filter((recipe) =>
        recipe.title.toLowerCase().includes(query)
      );
    }

    if (selectedFilters.length > 0) {
      matches = matches.filter((recipe) =>
        selectedFilters.every((filter) => recipe.tags?.includes(filter))
      );
    }

    if (matches.length > 0) {
      searchResults.innerHTML = matches
        .map(
          (item) =>
            `<div class="search-item" data-page="${item.page || "#"}">${item.title}</div>`
        )
        .join("");
    } else {
      searchResults.innerHTML =
        "<div class='no-results'>No results found</div>";
    }

    searchResults.style.display = "block";
  });

  // Click result → navigate
  searchResults.addEventListener("click", (e) => {
    if (e.target.classList.contains("search-item")) {
      const page = e.target.getAttribute("data-page");
      if (page && page !== "#") window.location.href = page;
    }
  });
}

  // -----------------------------
  // AUTH NAV LINK
  // -----------------------------
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

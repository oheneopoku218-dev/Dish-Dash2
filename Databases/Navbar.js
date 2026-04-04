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
  resultsBox.style.cssText = `
    position: absolute;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    max-height: 300px;
    overflow-y: auto;
    z-index: 999;
    display: none;
    min-width: 250px;
  `;
  searchInput.parentElement.style.position = "relative";
  searchInput.parentElement.appendChild(resultsBox);

  let allRecipes = [];

  async function fetchAllRecipes() {
    try {
      const userId = localStorage.getItem("userId");
      const headers = userId ? { "x-user-id": userId } : {};
      const res = await fetch(`${API_BASE}/api/recipes`, { headers });
      allRecipes = await res.json();
    } catch (err) {
      console.error("Search fetch error:", err);
    }
  }

  fetchAllRecipes();

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
      resultsBox.style.display = "none";
      return;
    }

    const matches = allRecipes.filter(r =>
      r.title?.toLowerCase().includes(query) ||
      r.category?.toLowerCase().includes(query)
    );

    if (!matches.length) {
      resultsBox.innerHTML = `<div style="padding:12px;color:#999;">No results found</div>`;
    } else {
      resultsBox.innerHTML = matches.map(r => `
        <div onclick="window.location.href='recipe-detail.html?id=${r.id}'"
          style="padding:12px 16px;cursor:pointer;border-bottom:1px solid #f0f0f0;font-size:0.9rem;">
          <strong>${r.title}</strong>
          <span style="color:#ff8c42;font-size:0.8rem;margin-left:8px;">${r.category || ""}</span>
        </div>
      `).join("");
    }

    resultsBox.style.display = "block";
  });

  document.addEventListener("click", (e) => {
    if (!searchInput.parentElement.contains(e.target)) {
      resultsBox.style.display = "none";
    }
  });
}

let allrecipes = [];
  let filteredrecipes = [];

  async function loadRecipes() {
    try {
      const res = await fetch(`${API_BASE}/api/recipes`);
      if (!res.ok) throw new Error("Failed to load recipes");
      allrecipes = await res.json();
      filteredrecipes = allrecipes;
      displayrecipes(filteredrecipes);
    } catch (error) {
      console.error("Error loading recipes:", error);
      const container = document.getElementById("recipes-container");
      if (container) container.innerHTML = "<p>Error loading recipes.</p>";
    }
  }

  function displayrecipes(list) {
    const container = document.getElementById("recipes-container");
    if (!container) return;
    container.innerHTML = "";
    if (list.length === 0) {
      container.innerHTML = "<p>No recipes found.</p>";
      return;
    }
    list.forEach((recipe) => {
      const recipeCard = document.createElement("div");
      recipeCard.className = "recipe-card";
      recipeCard.innerHTML = `
        <h3>${recipe.name || recipe.title}</h3>
        <p><strong>Category:</strong> ${recipe.category || recipe.mealType || ""}</p>
        <p><strong>Ingredients:</strong> ${(recipe.ingredients || []).join(", ")}</p>
        <p><strong>Instructions:</strong> ${recipe.instructions || (recipe.steps || []).join(" ")}</p>
        <button onclick="viewRecipe('${recipe.name || recipe.title}')">View Details</button>
      `;
      container.appendChild(recipeCard);
    });
  }

  function filterrecipes() {
    const query = document.getElementById("SearchBar").value.toLowerCase();
    filteredrecipes = allrecipes.filter(recipe =>
      (recipe.name || recipe.title || "").toLowerCase().includes(query) ||
      (recipe.category || recipe.mealType || "").toLowerCase().includes(query)
    );
    displayrecipes(filteredrecipes);
  }

  function viewRecipe(name) {
    const recipe = allrecipes.find(r => (r.name || r.title) === name);
    if (!recipe) return;
    localStorage.setItem("selectedRecipe", JSON.stringify(recipe));
    window.location.href = "Viewer.html";
  }

  window.onload = loadRecipes;
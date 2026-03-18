document.addEventListener("DOMContentLoaded",()=>{
    const currentuser = localStorage.getItem("currentUser");
    if (!currentuser) {
        window.location.href = "login.html";
        return;
    }
    const allUsers = JSON.parse(localStorage.getItem("users")) || [];
    const userdata = allUsers[currentuser];
    const recipeBoxContainer = document.querySelector("#recipeBoxContainer");
    if (!userdata || !userdata.favorites || userdata.favorites.length === 0) {
        recipeBoxContainer.innerHTML = "<p>Your recipe box is empty. Go add some favorite recipes!</p><a href='recipes.html'>Browse Recipes</a>";
        return;
    }
    fetch("recipes.json")
    .then(response => response.json())
    .then(recipes => {
    const favoriteIDs = userdata.favorites;
    const favoriteRecipes = recipes.filter(recipe => favoriteIDs.includes(recipe.id));
      favoriteRecipes.forEach(recipe => {
       const card = document.createElement("div");
      card.classList.add("recipe-card");
      card.innerHTML = `
      <h3>${recipe.name}</h3>
      <img src="${recipe.image}" alt="${recipe.name}">
      <div class="recipe-info">
      <p>${recipe.description}</p>
       <a href="recipe_detail.html?id=${recipe.id}">View Recipe</a>
       </div>
     `;
       recipeBoxContainer.appendChild(card);
        const btn = document.querySelector(".remove-btn");
        btn.addEventListener("click", () => {
          const recipeID = btn.getAttribute("data-id");
          const index = userdata.favorites.indexOf(recipeID);
          if (index !== -1) {
            userdata.favorites.splice(index, 1);
            allUsers[currentuser] = userdata;
            localStorage.setItem("users", JSON.stringify(allUsers));
            location.reload();
          }
        });
      });
      })
      .catch(error => {
        console.error("Error fetching recipes:", error);
        recipeBoxContainer.innerHTML = "<p>There was an error loading your recipes.</p>";
      });
  });
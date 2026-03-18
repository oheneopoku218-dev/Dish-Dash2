document.addEventListener("DOMContentLoaded",()=>{
    const currentuser = localStorage.getItem("Username");
    if (!currentuser) {
        window.location.href = "Login.html";
        return;
    }
    const welcomeMessage = document.getElementById("welcome-message");
    welcomeMessage.textContent = `Welcome, ${currentuser}!`;
    
    const usernamedisplay = document.querySelector("#username");
    if(usernamedisplay){
        usernamedisplay.textContent = currentuser;
    }
// corrected section starting here//
    const allUsers = JSON.parse(localStorage.getItem("users")) || [];
const userdata = allUsers.find(u => u.username === currentuser);
 const favoritesContainer = document.querySelector("#favoritesPreview");
 if (!userdata || !userdata.favorites) {
    favoritesContainer.innerHTML =`
    <p>You have no favorite recipes yet.</p>
    <a href="recipe box.html">Go to Recipe Box</a>
    `;
    return;
}
 
userdata.favorites = userdata.favorites.map(f => Number(f));
    if (userdata.favorites.length === 0) {
    favoritesContainer.innerHTML =`
    <p>You have no favorite recipes yet.</p>
    <a href="recipe box.html">Go to Recipe Box</a>
    `;
    return;
 }
 // correcting section ending here//
fetch("recipes.json")
    .then(response => response.json())
    .then(recipes => {
favoritesContainer.innerHTML ="";
  userdata.favorites.forEach(favId => {
    const recipe = recipes.find(r => r.id === favId);
    if(!recipe) return;
    
    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");
    recipeCard.innerHTML = `
    <h3>${recipe.name}</h3>
    <img src="${recipe.image}" alt="${recipe.name}" />
    <p>Ingredients: ${recipe.ingredients.join(", ")}</p>
    <p>Instructions: ${recipe.instructions}</p>
    <a href="recipe.html?id=${recipe.id}">View Recipe</a>
    `;
    favoritesContainer.appendChild(recipeCard);
  });
})
.catch(error => {
    console.error("Error loading recipes:", error);
    favoritesContainer.innerHTML = "<p>Error loading favorite recipes. Please try again later.</p>";
});
});
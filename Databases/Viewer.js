let allrecipes = []
let filtredrecipes = []
let popularrecipes=[]
async function loadRecipes() {
  try {
  const files =[
    "Breakfast.json"
    ,"Lunch.json"
    ,"Dinner.json"
    ,"Dessert.json"
    ,"Snacks.json"
  ];
    for(const file of files){}
  const res = await fetch(File)
    allrecipes = await res.json()
    filtredrecipes=allrecipes
    populaterecipes(allrecipes);
    displayrecipes(filtredrecipes);
    } catch (error) {
    console.error("Error loading recipes:", error);
    }
}
function displayrecipes(list){
    const container = document.getElementById("recipes-container");
    container.innerHTML = "";
    if (list.length===0){
        container.innerHTML = "<p>No recipes found.</p>";
        return;
    }
    list.forEach((recipe) => {
    const recipeCard = document.createElement("div");
    recipeCard.className = "recipe-card";
    recipeCard.innerHTML = `
      <h3>${recipe.name}</h3>
      <p><strong>Category:</strong> ${recipe.category}</p>
      <p><strong>Ingredients:</strong> ${recipe.ingredients.join(", ")}</p>
      <p><strong>Instructions:</strong> ${recipe.instructions}</p>
      <button onclick="viewRecipeDetails(${recipe.id})">View Details</button>
    `;
    container.appendChild(recipeCard);
    });
}
function filterrecipes (){
   const query = document.getElementById("SearchBar").value.toLowerCase();
    filtredrecipes = allrecipes.filter(recipe => 
         recipe.name.toLowerCase().includes(query) ||
         recipe.category.toLowerCase().includes(query)
    );
displayrecipes(filtredrecipes);
}
function viewRecipe(name){
    const recipe = allrecipes.find(r => r.name === name);
    if (!recipe) return;
    localStorage.setItem("selectedRecipe", Json.stringify(recipe));
    window.location.href = "recipeDetails.html";
}
window.onload = loadRecipes;

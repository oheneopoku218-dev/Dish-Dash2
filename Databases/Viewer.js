function displayRecipeDetail() {
  const container = document.getElementById("recipe-detail");
  if (!container) return;

  const stored = localStorage.getItem("selectedRecipe");
  if (!stored) {
    container.innerHTML = "<p>No recipe selected. <a href='Dish-Dash.html'>Go back</a></p>";
    return;
  }

  const r = JSON.parse(stored);
  const cc = r.culturalContext || {};

  container.innerHTML = `
    <button onclick="window.history.back()" style="margin-bottom:20px;cursor:pointer;">← Back</button>

    <h2>${r.title || r.name || "Untitled Recipe"}</h2>
    <p style="color:#666;">${r.category || r.mealType || ""} ${r.authorName ? "· by " + r.authorName : ""}</p>

    ${r.description ? `<p style="margin:16px 0;">${r.description}</p>` : ""}

    <div style="display:flex;gap:16px;margin:16px 0;flex-wrap:wrap;">
      ${r.cookingTime ? `<span><strong>Time:</strong> ${r.cookingTime} mins</span>` : ""}
      ${r.difficulty ? `<span><strong>Difficulty:</strong> ${r.difficulty}</span>` : ""}
      ${r.dietaryTags?.length ? `<span><strong>Tags:</strong> ${r.dietaryTags.join(", ")}</span>` : ""}
    </div>

    ${r.ingredients?.length ? `
      <h3>Ingredients</h3>
      <ul>${r.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
    ` : ""}

    ${r.steps?.length ? `
      <h3>Steps</h3>
      <ol>${r.steps.map(s => `<li>${s}</li>`).join("")}</ol>
    ` : ""}

    ${(cc.story || cc.occasion || cc.variations) ? `
      <div style="margin-top:32px;padding:24px;background:#fff8f3;border-left:4px solid #ff8c42;border-radius:8px;">
        <h3 style="color:#ff8c42;margin-bottom:12px;">Cultural Context</h3>
        ${cc.story ? `<p><strong>Story:</strong> ${cc.story}</p>` : ""}
        ${cc.occasion ? `<p><strong>When eaten:</strong> ${cc.occasion}</p>` : ""}
        ${cc.variations ? `<p><strong>Regional variations:</strong> ${cc.variations}</p>` : ""}
      </div>
    ` : ""}
  `;
}

window.onload = displayRecipeDetail;

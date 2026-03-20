function signOut() {
  localStorage.removeItem("username");
  localStorage.removeItem("userId");
  localStorage.removeItem("profilePic");
  window.location.href = "Login.html";
}

function editprofilepicture() {
  const newUrl = prompt("Enter image URL for your profile picture:");
  if (newUrl) {
    const profilePic = document.getElementById("profile-pic");
    if (profilePic) profilePic.src = newUrl;
    localStorage.setItem("profilePic", newUrl);
  }
}

function viewRecipe(recipe) {
  localStorage.setItem("selectedRecipe", JSON.stringify(recipe));
  window.location.href = "Viewer.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  const currentuser = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");

  if (!currentuser) {
    window.location.href = "Login.html";
    return;
  }

  const welcomeMessage = document.getElementById("welcome-message");
  if (welcomeMessage) welcomeMessage.textContent = `Welcome, ${currentuser}!`;

  const usernamedisplay = document.getElementById("username");
  if (usernamedisplay) usernamedisplay.textContent = `@${currentuser}`;

  const profilePic = document.getElementById("profile-pic");
  if (profilePic) {
    const saved = localStorage.getItem("profilePic");
    profilePic.src = saved || `https://ui-avatars.com/api/?background=ff8c42&color=fff&size=128&name=${currentuser}`;
  }

  // Load My Recipes
  const myRecipesContainer = document.getElementById("myRecipes");
  if (!myRecipesContainer) return;

  myRecipesContainer.innerHTML = "<p class='empty-msg'>Loading your recipes...</p>";

  try {
    const res = await fetch(`${API_BASE}/api/recipes`, {
      headers: { "x-user-id": userId }
    });

    if (!res.ok) throw new Error("Failed to load recipes");

    const allRecipes = await res.json();
    const myRecipes = allRecipes.filter(r => String(r.authorId) === String(userId));

    if (!myRecipes.length) {
      myRecipesContainer.innerHTML = `<p class="empty-msg">You haven't added any recipes yet. <a href="Recipe Form.html">Add one</a></p>`;
      return;
    }

    myRecipesContainer.innerHTML = myRecipes.map(recipe => `
      <div class="favorite-card" onclick='viewRecipe(${JSON.stringify(recipe)})' style="cursor:pointer">
        <h4>${recipe.title || "Untitled"}</h4>
        <p>${recipe.description || ""}</p>
        <span class="private-badge" style="background:${recipe.isPublic ? "#ff8c42" : "#999"}">${recipe.isPublic ? "Public" : "Private"}</span>
      </div>
    `).join("");

  } catch (err) {
    console.error("My recipes error:", err);
    myRecipesContainer.innerHTML = "<p class='empty-msg'>Could not load your recipes.</p>";
  }
});

 const API_BASE = "https://ideal-pancake-x5g9g6 55wwgphrpr-5000.app.github.dev";

  document.addEventListener("DOMContentLoaded",
  () => {
    const currentuser =
  localStorage.getItem("username");
    if (!currentuser) {
      window.location.href = "Login.html";
      return;
    }

    // Set welcome message
    const welcomeMessage =
  document.getElementById("welcome-message");
    if (welcomeMessage)
  welcomeMessage.textContent = `Welcome,
  ${currentuser}!`;

    // Set username tag
    const usernamedisplay =
  document.getElementById("username");
    if (usernamedisplay)
  usernamedisplay.textContent =
  `@${currentuser}`;

    // Load favorites
    const favoritesContainer =
  document.getElementById("favoritesPreview");
    if (!favoritesContainer) return;

    const userId =
  localStorage.getItem("userId");
    if (!userId) {
      favoritesContainer.innerHTML = `<p
  class="empty-msg">No favorites yet. <a
  href="recipe box.html">Browse
  recipes</a></p>`;
      return;
    }

    fetch(`${API_BASE}/api/favorites/${userId}`)
      .then(res => res.json())
      .then(favorites => {
        if (!favorites || favorites.length ===
  0) {
          favoritesContainer.innerHTML = `<p
  class="empty-msg">No favorites yet. <a
  href="recipe box.html">Browse
  recipes</a></p>`;
          return;
        }

        favoritesContainer.innerHTML = "";
        favorites.forEach(recipe => {
          const card =
  document.createElement("div");
          card.classList.add("favorite-card");
          card.innerHTML = `
            <img src="${recipe.image || ''}"
  alt="${recipe.name}"
  onerror="this.style.display='none'"/>
            <h4>${recipe.name}</h4>
            <a class="view-btn"
  href="Viewer.html?id=${recipe._id}">View
  Recipe</a>
          `;
          favoritesContainer.appendChild(card);
        });
      })
      .catch(() => {
        favoritesContainer.innerHTML = `<p
  class="empty-msg">Could not load
  favorites.</p>`;
      });
  });
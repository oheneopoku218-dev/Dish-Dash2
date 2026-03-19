
  const API_BASE = "https://ideal-pancake-x5g9g655wwgphrpr-5000.app.github.dev";
  function signOut() {
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
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

  document.addEventListener("DOMContentLoaded", () => {
    const currentuser = localStorage.getItem("username");
    if (!currentuser) {
      window.location.href = "Login.html";
      return;
    }

    // Welcome message
    const welcomeMessage = document.getElementById("welcome-message");
    if (welcomeMessage) welcomeMessage.textContent = `Welcome, ${currentuser}!`;

    // Username tag
    const usernamedisplay = document.getElementById("username");
    if (usernamedisplay) usernamedisplay.textContent = `@${currentuser}`;

    // Profile pic
    const profilePic = document.getElementById("profile-pic");
    if (profilePic) {
      const saved = localStorage.getItem("profilePic");
      profilePic.src = saved || `https://ui-avatars.com/api/?background=ff8c42&color=fff&size=128&name=${currentuser}`;
    }

    // Favorites
    const favoritesContainer = document.getElementById("favoritesPreview");
    if (!favoritesContainer) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      favoritesContainer.innerHTML = `<p class="empty-msg">No favorites yet. <a href="recipe box.html">Browse recipes</a></p>`;
      return;
    }

    fetch(`${API_BASE}/api/favorites/${userId}`)
      .then(res => res.json())
      .then(favorites => {
        if (!favorites || favorites.length === 0) {
          favoritesContainer.innerHTML = `<p class="empty-msg">No favorites yet. <a href="recipe box.html">Browse recipes</a></p>`;
          return;
        }
        favoritesContainer.innerHTML = "";
        favorites.forEach(recipe => {
          const card = document.createElement("div");
          card.classList.add("favorite-card");
          card.innerHTML = `
            <img src="${recipe.image || ''}" alt="${recipe.name}" onerror="this.style.display='none'"/>
            <h4>${recipe.name}</h4>
            <a class="view-btn" href="Viewer.html?id=${recipe._id}">View Recipe</a>
          `;
          favoritesContainer.appendChild(card);
        });
      })
      .catch(() => {
        favoritesContainer.innerHTML = `<p class="empty-msg">Could not load favorites.</p>`;
      });
  });

 document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("userId");
    const container = document.getElementById("recipeBoxContainer");

    if (!userId) {
      window.location.href = "Login.html";
      return;
    }

    container.innerHTML = "<p>Loading your recipe box...</p>";

    try {
      const [favRes, recipeRes] = await Promise.all([
        fetch(`${API_BASE}/api/favorites/user/${userId}`, { headers: { "x-user-id": userId } }),
        fetch(`${API_BASE}/api/recipes`)
      ]);

      if (!favRes.ok) throw new Error("Failed to load favorites");
      const favorites = await favRes.json();
      const recipes = recipeRes.ok ? await recipeRes.json() : [];

      if (!favorites.length) {
        container.innerHTML = "<p>Your recipe box is empty. Go add some favorite recipes!</p>";
        return;
      }

      container.innerHTML = "";

      favorites.forEach((fav) => {
        const recipe = recipes.find(r => String(r.id) === String(fav.recipeId));
        const card = document.createElement("div");
        card.classList.add("recipe-card");
        card.innerHTML = `
          <h3>${recipe ? recipe.title : "Recipe #" + fav.recipeId}</h3>
          ${recipe ? `<p>${recipe.description || ""}</p>` : ""}
          <button class="remove-btn" data-fav-id="${fav.id}">Remove</button>
        `;

        card.querySelector(".remove-btn").addEventListener("click", async () => {
          try {
            await fetch(`${API_BASE}/api/favorites`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                "x-user-id": userId
              },
              body: JSON.stringify({ userId, recipeId: fav.recipeId })
            });
            card.remove();
            if (!container.querySelector(".recipe-card")) {
              container.innerHTML = "<p>Your recipe box is empty.</p>";
            }
          } catch (err) {
            console.error("Remove error:", err);
          }
        });

        container.appendChild(card);
      });
    } catch (err) {
      console.error("Recipe box error:", err);
      container.innerHTML = "<p>Error loading your recipe box.</p>";
    }
  });
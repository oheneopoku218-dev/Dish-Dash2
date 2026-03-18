const DINNER_API =
  "https://ideal-pancake-x5g9g655wwgphrpr-5000.app.github.dev/api/dinner";

async function loadDinner() {
  const container = document.getElementById("dinner-container");
  if (!container) return;

  container.textContent = "Loading dinner...";

  try {
    const res = await fetch(DINNER_API);

    if (!res.ok) {
      throw new Error("Failed to load dinner");
    }

    const items = await res.json();

    if (!items.length) {
      container.textContent = "No dinner items found.";
      return;
    }

    container.innerHTML = items
      .map(
        (item) => `
        <div class="meal-card">
          <h3>${item.name || "Untitled"}</h3>

          ${
            item.calories
              ? `<p><strong>Calories:</strong> ${item.calories}</p>`
              : ""
          }

          ${
            item.ingredients && item.ingredients.length
              ? `<p><strong>Ingredients:</strong> ${item.ingredients.join(
                  ", "
                )}</p>`
              : ""
          }
        </div>
      `
      )
      .join("");

  } catch (err) {
    console.error("Dinner load error:", err);
    container.textContent = "Error loading dinner.";
  }
}

document.addEventListener("DOMContentLoaded", loadDinner);

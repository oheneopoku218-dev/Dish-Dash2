const BREAKFAST_API =
  "https://ideal-pancake-x5g9g655wwgphrpr-5000.app.github.dev/api/breakfast";

async function loadBreakfast() {
  const container = document.getElementById("breakfast-container");
  if (!container) return;

  container.textContent = "Loading breakfast...";

  try {
    const res = await fetch(BREAKFAST_API);

    if (!res.ok) {
      throw new Error("Failed to load breakfast");
    }

    const items = await res.json();

    if (!items.length) {
      container.textContent = "No breakfast items found.";
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
    console.error("Breakfast load error:", err);
    container.textContent = "Error loading breakfast.";
  }
}

document.addEventListener("DOMContentLoaded", loadBreakfast);


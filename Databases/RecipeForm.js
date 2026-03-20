const currentUser = localStorage.getItem("username");
const currentUserId = localStorage.getItem("userId");
if (!currentUser) window.location.href = "Login.html";

const form = document.getElementById("recipe-form");
const stepsBox = document.getElementById("stepsBox");

stepsBox.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-step")) {
    const stepCount = stepsBox.querySelectorAll(".step-row").length + 1;
    const newRow = document.createElement("div");
    newRow.classList.add("step-row");
    newRow.innerHTML = `
      <span class="step-number">${stepCount}.</span>
      <input type="text" class="step-input" placeholder="Enter step description" required>
      <button type="button" class="add-step">+ Add Step</button>
      <button type="button" class="remove-step">Remove</button>
    `;
    stepsBox.appendChild(newRow);
  }
});

stepsBox.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-step")) {
    const rows = stepsBox.querySelectorAll(".step-row");
    if (rows.length > 1) {
      e.target.parentElement.remove();
      updateStepNumbers();
    }
  }
});

function updateStepNumbers() {
  stepsBox.querySelectorAll(".step-row").forEach((row, i) => {
    row.querySelector(".step-number").textContent = `${i + 1}.`;
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorBox = document.getElementById("form-error");
  errorBox.textContent = "";

  const steps = [...document.querySelectorAll(".step-input")].map(i => i.value.trim());
  const mealType = document.getElementById("mealType").value;
  const visibility = document.getElementById("visibility").value;

  const recipeData = {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    ingredients: document.getElementById("ingredients").value.split(",").map(i => i.trim()),
    steps,
    cookingTime: Number(document.getElementById("cookingTime").value),
    difficulty: document.getElementById("difficulty").value,
    mealType,
    category: mealType.toLowerCase(),
    dietaryTags: document.getElementById("dietaryTags").value.split(",").map(t => t.trim()).filter(Boolean),
    origin: document.getElementById("origin").value.trim(),
    tradition: document.getElementById("tradition").value.trim(),
    visibility,
    isPublic: visibility === "public",
    culturalContext: {
      story: document.getElementById("culturalStory").value.trim(),
      occasion: document.getElementById("culturalOccasion").value.trim(),
      variations: document.getElementById("culturalVariations").value.trim()
    }
  };

  try {
    const res = await fetch(`${API_BASE}/api/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": currentUserId || ""
      },
      body: JSON.stringify(recipeData)
    });

    const data = await res.json();
    if (!res.ok) {
      errorBox.textContent = data.message || "Failed to save recipe.";
      return;
    }

    alert("Recipe added successfully!");
    window.location.href = "account.html";
  } catch (err) {
    console.error(err);
    errorBox.textContent = "Server error. Try again later.";
  }
});

const form = document.getElementById("recipe-form");
const stepsBox = document.getElementById("stepsBox");

// Add Step
stepsBox.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-step")) {
    const newRow = document.createElement("div");
    newRow.classList.add("step-row");

    const stepCount = stepsBox.querySelectorAll(".step-row").length + 1;

    newRow.innerHTML = `
      <span class="step-number">${stepCount}.</span>
      <input type="text" class="step-input" placeholder="Enter step description" required>
      <button type="button" class="add-step">Add Step</button>
      <button type="button" class="remove-step">Remove Step</button>
    `;

    stepsBox.appendChild(newRow);
    updateStepNumbers();
  }
});

// Remove Step
stepsBox.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-step")) {
    const rows = stepsBox.querySelectorAll(".step-row");
    if (rows.length > 1) {
      e.target.parentElement.remove();
      updateStepNumbers();
    }
  }
});

// Update numbering
function updateStepNumbers() {
  const rows = stepsBox.querySelectorAll(".step-row");
  rows.forEach((row, index) => {
    row.querySelector(".step-number").textContent = `${index + 1}.`;
  });
}

// Submit form
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const steps = [...document.querySelectorAll(".step-input")].map(input => input.value);

  const recipeData = {
    title: document.getElementById("title").value,
    ingredients: document.getElementById("ingredients").value.split(",").map(i => i.trim()),
    steps: steps,
    cookingTime: Number(document.getElementById("cookingTime").value),
    difficulty: document.getElementById("difficulty").value,
    mealType: document.getElementById("mealType").value,
    dietaryTags: document.getElementById("dietaryTags").value.split(",").map(t => t.trim()),
    origin: document.getElementById("origin").value,
    tradition: document.getElementById("tradition").value,
    visibility: "public",
    user: localStorage.getItem("currentUser")
  };

  try {
    const res = await fetch("http://localhost:3000/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recipeData)
    });

    const data = await res.json();
    console.log("Saved:", data);

    alert("Recipe added successfully!");
    window.location.href = "Viewer.html"; // or wherever you want to redirect
  } catch (err) {
    console.error(err);
    alert("Error saving recipe.");
  }
});

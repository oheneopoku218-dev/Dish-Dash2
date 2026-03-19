

 // REPLACE with:
  const LOGIN_API = `${API_BASE}/api/users/login`;

// --------------------------------------
// EMAIL VALIDATION
// --------------------------------------
function validateEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

// --------------------------------------
// SIGNUP HANDLER
// --------------------------------------
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("error-message");

  // Clear previous errors
  errorBox.textContent = "";

  // --------------------------------------
  // VALIDATION
  // --------------------------------------
  if (!username || !email || !password) {
    errorBox.textContent = "All fields are required.";
    return;
  }

  if (!validateEmail(email)) {
    errorBox.textContent = "Please enter a valid email.";
    return;
  }

  // --------------------------------------
  // SEND REQUEST
  // --------------------------------------
  try {
    const response = await fetch(SIGNUP_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, email, password })
    });

    console.log("Response status:", response.status);

    // Handle non-JSON responses safely
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("Invalid JSON response from server");
    }

    if (!response.ok) {
      errorBox.textContent = data.message || "Signup failed.";
      return;
    }

    // --------------------------------------
    // SUCCESS
    // --------------------------------------
    alert("Signup successful! 🎉");
    window.location.href = "Login.html";

  } catch (error) {
    console.error("Signup error:", error);
    errorBox.textContent = "Unable to connect to server.";
  }
});

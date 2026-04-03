 // REPLACE with:
  const LOGIN_API = `${API_BASE}/api/users/login`;

  async function login(event) {
    event.preventDefault();

    const usernameInput = document.getElementById("login-username");
    const passwordInput = document.getElementById("login-password");
    const errorBox = document.getElementById("login-error");

    errorBox.textContent = "";

    const payload = {
      username: usernameInput.value.trim(),
      password: passwordInput.value.trim()
    };

    try {
      const res = await fetch(LOGIN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      let data;
      try {
        data = await res.json();
      } catch {
        errorBox.textContent = "Server returned an invalid response.";
        errorBox.style.color = "red";
        return;
      }

      if (!res.ok) {
        errorBox.textContent = data.message || data.error || "Login failed.";
        errorBox.style.color = "red";
        return;
      }

      localStorage.setItem("userId", data.id);
      localStorage.setItem("username", data.username);
      localStorage.setItem("profilePic", data.profilePic || "");

      window.location.href = "Dish-Dash.html";

    } catch (err) {
      console.error("Login error:", err);
      errorBox.textContent = "Server error. Try again later.";
      errorBox.style.color = "red";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    if (form) form.onsubmit = login;
  });

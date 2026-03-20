var hostname = window.location.hostname;

var API_BASE = hostname.includes("app.github.dev")
  ? "https://" + hostname.replace(/-\d+\.app\.github\.dev$/, "-5000.app.github.dev")
  : hostname.includes("onrender.com")
  ? "https://dish-dash2.onrender.com"
  : "http://localhost:5000";

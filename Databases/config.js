  var hostname = window.location.hostname;

  var API_BASE = hostname.includes("app.github.dev")
    ? "https://" + hostname.replace(/-\d+\.app\.github\.dev$/, "-5000.app.github.dev")
    : "http://localhost:5000";
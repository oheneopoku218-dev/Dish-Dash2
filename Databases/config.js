
  // Auto-detect API base URL so it works in any Codespace
  const hostname = window.location.hostname;

  // If running in Codespaces, swap the frontend port (5502) for backend (5000)
  const API_BASE = hostname.includes("app.github.dev")
    ? `https://${hostname.replace("-5502", "-5000")}`
    : "http://localhost:5000";

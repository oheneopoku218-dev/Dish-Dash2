// ---- AUTH LINK + ANNOUNCEMENT + ADMIN PANEL ----
document.addEventListener("DOMContentLoaded", async () => {
  const username = localStorage.getItem("username");
  const userId   = localStorage.getItem("userId");

  // Auth link
  const authLink = document.getElementById("auth-link");
  if (authLink) {
    if (username) {
      authLink.textContent = "My Account";
      authLink.href = "account.html";
    } else {
      authLink.textContent = "Login / Sign Up";
      authLink.href = "Login.html";
    }
  }

  // ---- ANNOUNCEMENT BANNER (visible to everyone) ----
  try {
    const annRes = await fetch(API_BASE + "/api/admin/announcement");
    if (annRes.ok) {
      const { announcement } = await annRes.json();
      if (announcement) {
        const banner = document.createElement("div");
        banner.id = "site-announcement-banner";
        banner.style.cssText =
          "background:linear-gradient(135deg,#FFD700,#FFA500);color:#1a1a1a;" +
          "text-align:center;padding:10px 48px 10px 16px;font-size:0.88rem;" +
          "font-weight:700;position:relative;z-index:500;letter-spacing:0.01em;";
        banner.innerHTML =
          announcement +
          '<button onclick="document.getElementById(\'site-announcement-banner\').remove()" ' +
          'style="position:absolute;right:14px;top:50%;transform:translateY(-50%);;' +
          'background:none;border:none;font-size:1.2rem;cursor:pointer;color:#000;line-height:1;">&times;</button>';
        document.body.insertBefore(banner, document.body.firstChild);
      }
    }
  } catch {}

  // ---- ADMIN BUTTON (itz.oxene only) ----
  if (username !== "itz.oxene") return;

  const nav = document.querySelector("header.navbar nav");
  if (nav) {
    const adminBtn = document.createElement("button");
    adminBtn.id = "admin-toggle-btn";
    adminBtn.textContent = "⚙ Admin";
    adminBtn.style.cssText =
      "background:linear-gradient(135deg,#FFD700,#FFA500);color:#000;border:none;" +
      "padding:6px 14px;font-weight:800;font-size:0.85rem;cursor:pointer;" +
      "letter-spacing:0.04em;margin-left:8px;font-family:inherit;";
    adminBtn.addEventListener("click", () => openAdminPanel("stats"));
    nav.appendChild(adminBtn);
  }

  // ---- BUILD ADMIN OVERLAY ----
  const overlay = document.createElement("div");
  overlay.id = "admin-overlay";
  overlay.style.cssText =
    "display:none;position:fixed;inset:0;background:rgba(0,0,0,0.65);" +
    "z-index:9999;justify-content:center;align-items:center;";

  const tabs = [
    { id: "stats",   label: "📊 Stats"   },
    { id: "users",   label: "👥 Users"   },
    { id: "recipes", label: "🍽 Recipes" },
    { id: "tools",   label: "🛠 Tools"   },
  ];

  overlay.innerHTML =
    '<div style="background:#fff;width:92%;max-width:700px;max-height:88vh;' +
    'overflow:hidden;display:flex;flex-direction:column;font-family:inherit;">' +

      // Header
      '<div style="background:#1a1a1a;padding:14px 20px;display:flex;' +
      'align-items:center;justify-content:space-between;flex-shrink:0;">' +
        '<div>' +
          '<h2 style="margin:0;color:#FFD700;font-size:1.05rem;font-weight:800;">⚙ Admin Dashboard</h2>' +
          '<p style="color:#777;font-size:0.75rem;margin:2px 0 0;">Logged in as <strong style="color:#FFD700;">itz.oxene</strong></p>' +
        '</div>' +
        '<button onclick="document.getElementById(\'admin-overlay\').style.display=\'none\'" ' +
        'style="background:none;border:none;color:#777;font-size:1.5rem;cursor:pointer;">&times;</button>' +
      '</div>' +

      // Tab bar
      '<div id="admin-tab-bar" style="display:flex;background:#fafafa;border-bottom:2px solid #f0f0f0;flex-shrink:0;">' +
        tabs.map(t =>
          '<button id="admin-tab-' + t.id + '" onclick="openAdminPanel(\'' + t.id + '\')" ' +
          'style="flex:1;padding:10px 4px;border:none;background:none;cursor:pointer;font-size:0.79rem;' +
          'font-weight:700;letter-spacing:0.03em;color:#999;border-bottom:3px solid transparent;' +
          'margin-bottom:-2px;font-family:inherit;text-transform:uppercase;">' +
          t.label + '</button>'
        ).join("") +
      '</div>' +

      // Body
      '<div id="admin-panel-body" style="padding:20px;overflow-y:auto;flex:1;min-height:0;">' +
        '<p style="color:#999;">Loading…</p>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);
  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.style.display = "none";
  });
});

// ================================================================
//  OPEN PANEL + ROUTE TO TAB
// ================================================================
async function openAdminPanel(tab) {
  tab = tab || "stats";
  const overlay = document.getElementById("admin-overlay");
  const body    = document.getElementById("admin-panel-body");
  if (!overlay || !body) return;

  overlay.style.display = "flex";
  body.innerHTML = '<p style="color:#999;">Loading…</p>';

  // Highlight active tab
  ["stats","users","recipes","tools"].forEach(t => {
    const btn = document.getElementById("admin-tab-" + t);
    if (!btn) return;
    const active = t === tab;
    btn.style.color = active ? "#ff8c42" : "#999";
    btn.style.borderBottomColor = active ? "#ff8c42" : "transparent";
    btn.style.background = active ? "#fff" : "#fafafa";
  });

  const headers = { "x-user-id": localStorage.getItem("userId") };
  try {
    if      (tab === "stats")   await _adminStats(body, headers);
    else if (tab === "users")   await _adminUsers(body, headers);
    else if (tab === "recipes") await _adminRecipes(body, headers);
    else if (tab === "tools")   await _adminTools(body, headers);
  } catch (err) {
    body.innerHTML = _err("Panel error: " + err.message);
  }
}

// ================================================================
//  TAB: STATS
// ================================================================
async function _adminStats(body, headers) {
  const res = await fetch(API_BASE + "/api/admin/stats", { headers });
  const d = await res.json();
  if (!res.ok) { body.innerHTML = _err(d.message); return; }

  const catRows = Object.entries(d.byCategory || {})
    .sort((a, b) => b[1] - a[1])
    .map(([cat, n]) =>
      '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f5f5f5;">' +
        '<span style="text-transform:capitalize;color:#555;">' + cat + '</span>' +
        '<strong style="color:#333;">' + n + '</strong>' +
      '</div>'
    ).join("");

  body.innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px;">' +
      _sbox("Total Recipes",   d.totalRecipes)   +
      _sbox("Public",          d.publicRecipes)  +
      _sbox("Private",         d.privateRecipes) +
      _sbox("Total Users",     d.totalUsers)     +
      _sbox("Reviews",         d.totalReviews)   +
      _sbox("Box Saves",       d.totalFavorites) +
    '</div>' +
    '<h4 style="margin:0 0 8px;color:#ff8c42;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.04em;">Recipes by Category</h4>' +
    '<div>' + (catRows || _nodata()) + '</div>';
}

// ================================================================
//  TAB: USERS
// ================================================================
async function _adminUsers(body, headers) {
  const res = await fetch(API_BASE + "/api/admin/users", { headers });
  const users = await res.json();
  if (!res.ok) { body.innerHTML = _err(users.message); return; }
  if (!users.length) { body.innerHTML = _nodata(); return; }

  body.innerHTML =
    '<p style="color:#888;font-size:0.8rem;margin:0 0 12px;">' + users.length + ' registered user(s). itz.oxene cannot be deleted.</p>' +
    '<div style="overflow-x:auto;">' +
    '<table style="width:100%;border-collapse:collapse;font-size:0.83rem;">' +
      '<thead>' +
        '<tr style="background:#f5f5f5;">' +
          '<th style="text-align:left;padding:8px 10px;font-weight:700;">Username</th>' +
          '<th style="text-align:left;padding:8px 10px;font-weight:700;">Email</th>' +
          '<th style="text-align:center;padding:8px 10px;font-weight:700;">Recipes</th>' +
          '<th style="padding:8px 10px;"></th>' +
        '</tr>' +
      '</thead>' +
      '<tbody>' +
        users.map(u =>
          '<tr id="admin-urow-' + u.id + '" style="border-bottom:1px solid #f0f0f0;">' +
            '<td style="padding:8px 10px;font-weight:' + (u.username === "itz.oxene" ? "800" : "500") + ';color:#333;">' +
              (u.username === "itz.oxene" ? '<span style="color:#FFD700;">★</span> ' : '') + u.username +
            '</td>' +
            '<td style="padding:8px 10px;color:#888;">' + (u.email || "—") + '</td>' +
            '<td style="padding:8px 10px;text-align:center;color:#555;">' + u.recipeCount + '</td>' +
            '<td style="padding:8px 10px;text-align:right;">' +
              (u.username !== "itz.oxene"
                ? '<button onclick="adminDeleteUser(\'' + u.id + '\',\'' + u.username.replace(/'/g,"") + '\')" ' +
                  'style="background:#cc3300;color:#fff;border:none;padding:4px 10px;cursor:pointer;font-size:0.75rem;font-weight:700;">Delete</button>'
                : '') +
            '</td>' +
          '</tr>'
        ).join("") +
      '</tbody>' +
    '</table></div>';
}

// ================================================================
//  TAB: RECIPES
// ================================================================
async function _adminRecipes(body, headers) {
  const res = await fetch(API_BASE + "/api/admin/recipes", { headers });
  const recipes = await res.json();
  if (!res.ok) { body.innerHTML = _err(recipes.message); return; }
  if (!recipes.length) { body.innerHTML = _nodata(); return; }

  body.innerHTML =
    '<p style="color:#888;font-size:0.8rem;margin:0 0 12px;">' + recipes.length + ' recipe(s) in database. Toggle visibility or delete any recipe.</p>' +
    '<div style="overflow-x:auto;">' +
    '<table style="width:100%;border-collapse:collapse;font-size:0.82rem;">' +
      '<thead>' +
        '<tr style="background:#f5f5f5;">' +
          '<th style="text-align:left;padding:8px 10px;font-weight:700;">Title</th>' +
          '<th style="text-align:left;padding:8px 10px;font-weight:700;">Author</th>' +
          '<th style="text-align:center;padding:8px 10px;font-weight:700;">Visibility</th>' +
          '<th style="padding:8px 10px;"></th>' +
        '</tr>' +
      '</thead>' +
      '<tbody>' +
        recipes.map(r =>
          '<tr id="admin-rrow-' + r.id + '" style="border-bottom:1px solid #f0f0f0;">' +
            '<td style="padding:8px 10px;">' +
              '<span style="font-weight:600;color:#333;">' + (r.title || "Untitled") + '</span><br>' +
              '<span style="color:#ff8c42;font-size:0.73rem;text-transform:capitalize;">' + (r.category || "") + '</span>' +
            '</td>' +
            '<td style="padding:8px 10px;color:#888;">' + (r.authorName || "?") + '</td>' +
            '<td style="padding:8px 10px;text-align:center;">' +
              '<button id="admin-vis-' + r.id + '" ' +
              'onclick="adminToggleVis(\'' + r.id + '\',' + (!r.isPublic) + ')" ' +
              'style="padding:3px 12px;border:none;cursor:pointer;font-size:0.75rem;font-weight:700;border-radius:2px;' +
              'background:' + (r.isPublic ? "#e8f5e9" : "#fff3e0") + ';' +
              'color:' + (r.isPublic ? "#2e7d32" : "#e65100") + ';">' +
              (r.isPublic ? "Public" : "Private") +
              '</button>' +
            '</td>' +
            '<td style="padding:8px 10px;text-align:right;">' +
              '<button onclick="adminDeleteRecipe(\'' + r.id + '\',\'' + (r.title || "").replace(/'/g,"") + '\')" ' +
              'style="background:#cc3300;color:#fff;border:none;padding:4px 10px;cursor:pointer;font-size:0.75rem;font-weight:700;">Delete</button>' +
            '</td>' +
          '</tr>'
        ).join("") +
      '</tbody>' +
    '</table></div>';
}

// ================================================================
//  TAB: TOOLS
// ================================================================
async function _adminTools(body, headers) {
  const [annRes, rotdRes, recRes] = await Promise.all([
    fetch(API_BASE + "/api/admin/announcement"),
    fetch(API_BASE + "/api/admin/rotd"),
    fetch(API_BASE + "/api/admin/recipes", { headers }),
  ]);
  const { announcement } = annRes.ok ? await annRes.json() : { announcement: "" };
  const rotd    = rotdRes.ok ? await rotdRes.json() : null;
  const recipes = recRes.ok  ? await recRes.json()  : [];

  const publicRecipes = recipes.filter(r => r.isPublic);

  body.innerHTML =

    // Announcement
    '<div style="margin-bottom:28px;">' +
      '<h4 style="margin:0 0 4px;color:#ff8c42;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.04em;">📢 Site Announcement Banner</h4>' +
      '<p style="color:#888;font-size:0.78rem;margin:0 0 10px;">Displays a gold banner at the top of every page. Leave empty to remove it.</p>' +
      '<textarea id="admin-ann-txt" rows="2" ' +
      'style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #ddd;' +
      'font-family:inherit;font-size:0.88rem;resize:vertical;">' +
      (announcement || "") + '</textarea>' +
      '<div style="margin-top:8px;display:flex;align-items:center;gap:10px;">' +
        '<button onclick="adminSaveAnn()" ' +
        'style="padding:7px 18px;background:#ff8c42;color:#fff;border:none;cursor:pointer;font-weight:700;font-family:inherit;font-size:0.85rem;">' +
        'Save Banner</button>' +
        '<span id="admin-ann-st" style="font-size:0.8rem;color:#888;"></span>' +
      '</div>' +
    '</div>' +

    '<hr style="border:none;border-top:1px solid #efefef;margin:0 0 24px;">' +

    // Recipe of the Day
    '<div>' +
      '<h4 style="margin:0 0 4px;color:#ff8c42;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.04em;">⭐ Recipe of the Day</h4>' +
      '<p style="color:#888;font-size:0.78rem;margin:0 0 10px;">Pinned at the top of the homepage. Only public recipes are shown.</p>' +
      '<select id="admin-rotd-sel" ' +
      'style="width:100%;padding:9px 10px;border:1px solid #ddd;font-family:inherit;font-size:0.88rem;">' +
        '<option value="">— None (disabled) —</option>' +
        publicRecipes.map(r =>
          '<option value="' + r.id + '"' + (rotd && String(rotd.id) === String(r.id) ? ' selected' : '') + '>' +
          (r.title || "Untitled") + ' (' + (r.category || "") + ')' +
          '</option>'
        ).join("") +
      '</select>' +
      '<div style="margin-top:8px;display:flex;align-items:center;gap:10px;">' +
        '<button onclick="adminSaveROTD()" ' +
        'style="padding:7px 18px;background:#ff8c42;color:#fff;border:none;cursor:pointer;font-weight:700;font-family:inherit;font-size:0.85rem;">' +
        'Set Recipe of the Day</button>' +
        '<span id="admin-rotd-st" style="font-size:0.8rem;color:#888;"></span>' +
      '</div>' +
    '</div>';
}

// ================================================================
//  ACTION HANDLERS
// ================================================================
async function adminDeleteUser(id, name) {
  if (!confirm("Delete user \"" + name + "\"?\nTheir recipes will remain but will show as orphaned.")) return;
  const res = await fetch(API_BASE + "/api/admin/users/" + id, {
    method: "DELETE",
    headers: { "x-user-id": localStorage.getItem("userId") }
  });
  if (res.ok) {
    const row = document.getElementById("admin-urow-" + id);
    if (row) { row.style.opacity = "0.4"; row.style.pointerEvents = "none"; }
  } else {
    const d = await res.json().catch(() => ({}));
    alert(d.message || "Delete failed.");
  }
}

async function adminToggleVis(id, makePublic) {
  const res = await fetch(API_BASE + "/api/admin/recipes/" + id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-user-id": localStorage.getItem("userId") },
    body: JSON.stringify({ isPublic: makePublic })
  });
  if (!res.ok) { alert("Could not update visibility."); return; }
  const btn = document.getElementById("admin-vis-" + id);
  if (!btn) return;
  btn.textContent = makePublic ? "Public" : "Private";
  btn.style.background = makePublic ? "#e8f5e9" : "#fff3e0";
  btn.style.color      = makePublic ? "#2e7d32" : "#e65100";
  btn.setAttribute("onclick", "adminToggleVis('" + id + "'," + (!makePublic) + ")");
}

async function adminDeleteRecipe(id, title) {
  if (!confirm("Permanently delete recipe:\n\"" + title + "\"?")) return;
  const res = await fetch(API_BASE + "/api/admin/recipes/" + id, {
    method: "DELETE",
    headers: { "x-user-id": localStorage.getItem("userId") }
  });
  if (res.ok) {
    const row = document.getElementById("admin-rrow-" + id);
    if (row) { row.style.opacity = "0.3"; row.style.pointerEvents = "none"; }
  } else {
    const d = await res.json().catch(() => ({}));
    alert(d.message || "Delete failed.");
  }
}

async function adminSaveAnn() {
  const text   = (document.getElementById("admin-ann-txt") || {}).value || "";
  const status = document.getElementById("admin-ann-st");
  const res = await fetch(API_BASE + "/api/admin/announcement", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": localStorage.getItem("userId") },
    body: JSON.stringify({ text })
  });
  if (status) {
    status.textContent = res.ok ? "✓ Saved!" : "✗ Error";
    status.style.color = res.ok ? "#2e7d32" : "#cc3300";
    setTimeout(() => { status.textContent = ""; }, 3000);
  }
}

async function adminSaveROTD() {
  const sel    = document.getElementById("admin-rotd-sel");
  const status = document.getElementById("admin-rotd-st");
  const recipeId = sel ? (sel.value || null) : null;
  const res = await fetch(API_BASE + "/api/admin/rotd", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": localStorage.getItem("userId") },
    body: JSON.stringify({ recipeId })
  });
  if (status) {
    status.textContent = res.ok ? "✓ Saved!" : "✗ Error";
    status.style.color = res.ok ? "#2e7d32" : "#cc3300";
    setTimeout(() => { status.textContent = ""; }, 3000);
  }
}

// ================================================================
//  UI HELPERS
// ================================================================
function _sbox(label, value) {
  return '<div style="background:#fff8f3;border:1px solid #ffe0c0;padding:12px 10px;text-align:center;">' +
    '<div style="font-size:1.5rem;font-weight:800;color:#ff8c42;">' + (value != null ? value : "—") + '</div>' +
    '<div style="font-size:0.75rem;color:#999;margin-top:3px;">' + label + '</div>' +
  '</div>';
}
function _err(msg)  { return '<p style="color:#cc3300;font-size:0.88rem;">' + (msg || "Error") + '</p>'; }
function _nodata()  { return '<p style="color:#aaa;font-size:0.88rem;">No data available.</p>'; }

// ---- SEARCH ----
const searchInput = document.getElementById("search-bar");
if (searchInput) {
  const resultsBox = document.createElement("div");
  resultsBox.id = "search-results";
  resultsBox.style.cssText =
    "position:absolute;top:100%;left:0;right:0;" +
    "background:white;border:1px solid #e0e0e0;" +
    "max-height:300px;overflow-y:auto;z-index:1000;display:none;";

  const searchContainer = searchInput.parentElement;
  searchContainer.style.position = "relative";
  searchContainer.appendChild(resultsBox);

  let allRecipes = [];
  let currentMatches = [];

  async function fetchRecipes() {
    try {
      const uid = localStorage.getItem("userId");
      const headers = uid ? { "x-user-id": uid } : {};
      const res = await fetch(API_BASE + "/api/recipes", { headers });
      allRecipes = res.ok ? await res.json() : [];
      localStorage.setItem("cachedAllRecipes", JSON.stringify(allRecipes));
    } catch (e) {
      const cached = localStorage.getItem("cachedAllRecipes");
      allRecipes = cached ? JSON.parse(cached) : [];
    }
  }
  fetchRecipes();

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) { resultsBox.style.display = "none"; return; }

    currentMatches = allRecipes.filter(r => {
      const inTitle      = (r.title || "").toLowerCase().includes(query);
      const inCategory   = (r.category || "").toLowerCase().includes(query);
      const inIngredient = Array.isArray(r.ingredients) &&
        r.ingredients.some(i => (i || "").toLowerCase().includes(query));
      return inTitle || inCategory || inIngredient;
    });

    if (!currentMatches.length) {
      resultsBox.innerHTML =
        '<div style="padding:10px 14px;color:#999;font-size:0.9rem;">No results found</div>';
    } else {
      resultsBox.innerHTML = currentMatches.map((r, i) =>
        '<div data-idx="' + i + '" style="padding:10px 14px;cursor:pointer;' +
        'border-bottom:1px solid #f0f0f0;font-size:0.9rem;">' +
          '<strong>' + (r.title || "Untitled") + '</strong>' +
          '<span style="color:#ff8c42;font-size:0.8rem;margin-left:8px;">' +
            (r.category || "") +
          '</span>' +
        '</div>'
      ).join("");

      resultsBox.querySelectorAll("[data-idx]").forEach(function (el) {
        el.addEventListener("click", function () {
          var recipe = currentMatches[Number(el.getAttribute("data-idx"))];
          localStorage.setItem("selectedRecipe", JSON.stringify(recipe));
          window.location.href = "recipe-detail.html";
          resultsBox.style.display = "none";
        });
      });
    }

    resultsBox.style.display = "block";
  });

  document.addEventListener("click", function (e) {
    if (!searchContainer.contains(e.target)) {
      resultsBox.style.display = "none";
    }
  });
}

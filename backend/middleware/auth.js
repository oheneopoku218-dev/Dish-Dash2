
  import fs from "fs";
  import path from "path";

  const usersFile = path.join(process.cwd(), "data", "users.json");

  function readUsers() {
    if (!fs.existsSync(usersFile)) return [];
    try {
      return JSON.parse(fs.readFileSync(usersFile, "utf8") || "[]");
    } catch {
      return [];
    }
  }

  export function optionalAuth(req, res, next) {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      req.user = null;
      return next();
    }
    const users = readUsers();
    req.user = users.find(u => String(u.id) === String(userId)) || null;
    next();
  }

  export function requireAuth(req, res, next) {
    const userId = req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ message: "Not authenticated." });
    const users = readUsers();
    const user = users.find(u => String(u.id) === String(userId));
    if (!user) return res.status(401).json({ message: "User not found." });
    req.user = user;
    next();
  }

  // alias used by recipe.routes.js
  export const authenticate = requireAuth;
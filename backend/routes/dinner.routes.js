  import express from "express";
  import fs from "fs";
  import path from "path";
  import { optionalAuth } from "../middleware/auth.js";

  const router = express.Router();
  const recipesFile = path.join(process.cwd(), "data", "recipes.json");

  function readJson() {
    if (!fs.existsSync(recipesFile)) return [];
    return JSON.parse(fs.readFileSync(recipesFile, "utf8") || "[]");
  }

  router.get("/", optionalAuth, (req, res) => {
    const recipes = readJson();
    const visible = recipes.filter(r =>
      (r.category || "").toLowerCase() === "dinner" &&
      (r.isPublic || (req.user && String(r.authorId) === String(req.user.id)))
    );
    res.json(visible);
  });

  export default router;
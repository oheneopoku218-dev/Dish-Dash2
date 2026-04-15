
  console.log("RUNNING SERVER.JS FROM:", process.cwd());


  import express from "express";
  import dotenv from "dotenv";
  import cors from "cors";
  import path from "path";
  import fs from "fs";
  import { fileURLToPath } from "url";

  // -----------------------------------------------------
  // CONFIG
  // -----------------------------------------------------
  dotenv.config();

  const app = express();
  const PORT = process.env.PORT || 5000;
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  // -----------------------------------------------------
  // VIEW ENGINE (EJS)
  // -----------------------------------------------------
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "ejs");

  // -----------------------------------------------------
  // CORS
  // -----------------------------------------------------
  const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-user-id", "Authorization"]
  };
  app.use(cors(corsOptions));

  // -----------------------------------------------------
  // MIDDLEWARE
  // -----------------------------------------------------
  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

  // -----------------------------------------------------
  // ROUTES IMPORT
  // -----------------------------------------------------
  import userRoutes from "./routes/user.routes.js";
  import breakfastRoutes from "./routes/breakfast.routes.js";
  import lunchRoutes from "./routes/lunch.routes.js";
  import dinnerRoutes from "./routes/dinner.routes.js";
  import snackRoutes from "./routes/snack.routes.js";
  import recipeBoxRoutes from "./routes/recipeBox.routes.js";
  import desertRoutes from "./routes/desert.routes.js";
  import recipeRoutes from "./routes/recipe.routes.js";
  import reviewRoutes from "./routes/review.routes.js";
  import favoriteRoutes from "./routes/favorite.routes.js";
  import recipeDetailRoutes from "./routes/recipeDetail.routes.js";
  import recipeBoxPageRoutes from "./routes/recipeBoxPage.routes.js";

  // -----------------------------------------------------
  // ROUTES
  // -----------------------------------------------------
  app.use("/api/users", userRoutes);
  app.use("/api/breakfast", breakfastRoutes);
  app.use("/api/lunch", lunchRoutes);
  app.use("/api/dinner", dinnerRoutes);
  app.use("/api/snack", snackRoutes);
  app.use("/api/recipebox", recipeBoxRoutes);
  app.use("/api/desert", desertRoutes);
  app.use("/api/recipes", recipeRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/favorites", favoriteRoutes);
  app.use("/recipe", recipeDetailRoutes);
  app.use("/recipebox", recipeBoxPageRoutes);

  // -----------------------------------------------------
  // ADMIN HELPERS
  // -----------------------------------------------------
  const _adminFiles = {
    users:     path.join(process.cwd(), "data", "users.json"),
    recipes:   path.join(process.cwd(), "data", "recipes.json"),
    reviews:   path.join(process.cwd(), "data", "reviews.json"),
    favorites: path.join(process.cwd(), "data", "favorites.json"),
    admin:     path.join(process.cwd(), "data", "admin.json"),
  };

  function _readJson(file, fallback = []) {
    try {
      if (!fs.existsSync(file)) return fallback;
      return JSON.parse(fs.readFileSync(file, "utf8") || JSON.stringify(fallback));
    } catch (e) {
      console.error("_readJson error:", file, e.message);
      return fallback;
    }
  }

  function _writeJson(file, data) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
  }

  function _requireAdmin(req, res) {
    const userId = req.headers["x-user-id"];
    const users = _readJson(_adminFiles.users, []);
    const user = users.find(u => String(u.id) === String(userId));
    if (!user || user.username !== "itz.oxene") {
      res.status(403).json({ message: "Access denied." });
      return null;
    }
    return user;
  }

  // -----------------------------------------------------
  // ADMIN — STATS
  // -----------------------------------------------------
  app.get("/api/admin/stats", (req, res) => {
    if (!_requireAdmin(req, res)) return;
    const recipes   = _readJson(_adminFiles.recipes,   []);
    const users     = _readJson(_adminFiles.users,     []);
    const reviews   = _readJson(_adminFiles.reviews,   []);
    const favorites = _readJson(_adminFiles.favorites, []);

    const byCategory = {};
    recipes.forEach(r => {
      const cat = (r.category || "other").toLowerCase();
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    res.json({
      totalUsers:     users.length,
      totalRecipes:   recipes.length,
      publicRecipes:  recipes.filter(r => r.isPublic).length,
      privateRecipes: recipes.filter(r => !r.isPublic).length,
      totalReviews:   reviews.length,
      totalFavorites: favorites.length,
      byCategory
    });
  });

  // -----------------------------------------------------
  // ADMIN — USERS
  // -----------------------------------------------------
  app.get("/api/admin/users", (req, res) => {
    if (!_requireAdmin(req, res)) return;
    const users   = _readJson(_adminFiles.users,   []);
    const recipes = _readJson(_adminFiles.recipes, []);
    res.json(users.map(u => ({
      id:          u.id,
      username:    u.username,
      email:       u.email || "",
      recipeCount: recipes.filter(r => String(r.authorId) === String(u.id)).length
    })));
  });

  app.delete("/api/admin/users/:id", (req, res) => {
    if (!_requireAdmin(req, res)) return;
    const users = _readJson(_adminFiles.users, []);
    const target = users.find(u => String(u.id) === req.params.id);
    if (!target) return res.status(404).json({ message: "User not found." });
    if (target.username === "itz.oxene") return res.status(400).json({ message: "Cannot delete admin account." });
    _writeJson(_adminFiles.users, users.filter(u => String(u.id) !== req.params.id));
    res.json({ message: "User deleted." });
  });

  // -----------------------------------------------------
  // ADMIN — RECIPES
  // -----------------------------------------------------
  app.get("/api/admin/recipes", (req, res) => {
    if (!_requireAdmin(req, res)) return;
    res.json(_readJson(_adminFiles.recipes, []));
  });

  app.patch("/api/admin/recipes/:id", (req, res) => {
    if (!_requireAdmin(req, res)) return;
    const recipes = _readJson(_adminFiles.recipes, []);
    const idx = recipes.findIndex(r => String(r.id) === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Recipe not found." });
    if (req.body.isPublic !== undefined) recipes[idx].isPublic = !!req.body.isPublic;
    _writeJson(_adminFiles.recipes, recipes);
    res.json(recipes[idx]);
  });

  app.delete("/api/admin/recipes/:id", (req, res) => {
    if (!_requireAdmin(req, res)) return;
    const recipes = _readJson(_adminFiles.recipes, []);
    if (!recipes.find(r => String(r.id) === req.params.id))
      return res.status(404).json({ message: "Recipe not found." });
    _writeJson(_adminFiles.recipes, recipes.filter(r => String(r.id) !== req.params.id));
    res.json({ message: "Recipe deleted." });
  });

  // -----------------------------------------------------
  // ADMIN — ANNOUNCEMENT BANNER (public read)
  // -----------------------------------------------------
  app.get("/api/admin/announcement", (req, res) => {
    const cfg = _readJson(_adminFiles.admin, {});
    res.json({ announcement: cfg.announcement || "" });
  });

  app.post("/api/admin/announcement", (req, res) => {
    if (!_requireAdmin(req, res)) return;
    const cfg = _readJson(_adminFiles.admin, {});
    cfg.announcement = req.body.text || "";
    _writeJson(_adminFiles.admin, cfg);
    res.json({ announcement: cfg.announcement });
  });

  // -----------------------------------------------------
  // ADMIN — RECIPE OF THE DAY (public read)
  // -----------------------------------------------------
  app.get("/api/admin/rotd", (req, res) => {
    const cfg = _readJson(_adminFiles.admin, {});
    if (!cfg.rotdId) return res.json(null);
    const recipes = _readJson(_adminFiles.recipes, []);
    const recipe = recipes.find(r => String(r.id) === String(cfg.rotdId));
    res.json(recipe || null);
  });

  app.post("/api/admin/rotd", (req, res) => {
    if (!_requireAdmin(req, res)) return;
    const cfg = _readJson(_adminFiles.admin, {});
    cfg.rotdId = req.body.recipeId || null;
    _writeJson(_adminFiles.admin, cfg);
    res.json({ rotdId: cfg.rotdId });
  });

  // -----------------------------------------------------
  // TEST ROUTES
  // -----------------------------------------------------
  app.get("/", (req, res) => {
    res.send("API is running...");
  });

  app.get("/test", (req, res) => {
    res.json({ success: true, message: "CORS is working ✅" });
  });

  // -----------------------------------------------------
  // ERROR HANDLER
  // -----------------------------------------------------
  app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.message);
    res.status(500).json({ error: err.message });
  });

  // -----------------------------------------------------
  // START SERVER
  // -----------------------------------------------------
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
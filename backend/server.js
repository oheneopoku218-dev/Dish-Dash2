
  console.log("RUNNING SERVER.JS FROM:", process.cwd());


  import express from "express";
  import dotenv from "dotenv";
  import cors from "cors";
  import path from "path";
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
  app.options("*", cors(corsOptions));

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
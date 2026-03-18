import express from "express";
import { getMealsByCategory } from "../controllers/meal.controller.js";

const router = express.Router();

router.get("/:category", getMealsByCategory);

export default router;

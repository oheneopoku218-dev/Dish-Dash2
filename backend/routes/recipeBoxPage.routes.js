import express from "express";

const router = express.Router();

// GET /recipebox  →  server-rendered Recipe Box page
// Auth is handled client-side (localStorage) since there is no server session.
// The page JS redirects to /login if no userId is found in localStorage.
router.get("/", (req, res) => {
  res.render("recipe-box");
});

export default router;

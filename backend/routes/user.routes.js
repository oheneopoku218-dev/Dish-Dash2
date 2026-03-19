 import express from "express";
  import fs from "fs";
  import path from "path";
  import multer from "multer";

  const router = express.Router();

  // -----------------------------------------------------
  // FILE PATH
  // -----------------------------------------------------
  const usersFile = path.join(process.cwd(), "data", "users.json");
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  // -----------------------------------------------------
  // MULTER SETUP
  // -----------------------------------------------------
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `user_${req.params.id}_${Date.now()}${ext}`);
    }
  });

  const upload = multer({ storage });

  // -----------------------------------------------------
  // HELPERS
  // -----------------------------------------------------
  function ensureFile(file, initial = "[]") {
    if (!fs.existsSync(file)) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, initial, "utf8");
    }
  }

  function readJson(file) {
    ensureFile(file);
    try {
      const raw = fs.readFileSync(file, "utf8");
      return JSON.parse(raw || "[]");
    } catch (err) {
      console.error("JSON READ ERROR:", err);
      return [];
    }
  }

  function writeJson(file, data) {
    try {
      fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
      console.error("JSON WRITE ERROR:", err);
    }
  }

  // -----------------------------------------------------
  // SIGNUP
  // -----------------------------------------------------
  router.post("/signup", (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
      }

      const users = readJson(usersFile);

      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ message: "Email already exists." });
      }

      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return res.status(400).json({ message: "Username already exists." });
      }

      const newUser = {
        id: Date.now(),
        username,
        email,
        password,
        profilePic: null
      };

      users.push(newUser);
      writeJson(usersFile, users);

      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      });

    } catch (error) {
      console.error("SIGNUP ERROR:", error);
      res.status(500).json({ message: "Server error." });
    }
  });

  router.get("/signup", (req, res) => {
    res.send("Signup route is working (GET test)");
  });

  // -----------------------------------------------------
  // LOGIN
  // -----------------------------------------------------
  router.post("/login", (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
      }

      const users = readJson(usersFile);
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

      if (!user || user.password !== password) {
        return res.status(400).json({ message: "Invalid username or password." });
      }

      res.json({
        id: user.id,
        username: user.username,
        profilePic: user.profilePic || null
      });

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      res.status(500).json({ message: "Server error." });
    }
  });

  // -----------------------------------------------------
  // UPLOAD PROFILE PICTURE
  // -----------------------------------------------------
  router.post("/:id/profile-pic", upload.single("profilePic"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      const users = readJson(usersFile);
      const userIndex = users.findIndex(u => String(u.id) === String(req.params.id));

      if (userIndex === -1) {
        return res.status(404).json({ message: "User not found." });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      users[userIndex].profilePic = imageUrl;
      writeJson(usersFile, users);

      res.json({ profilePic: imageUrl });

    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      res.status(500).json({ message: "Server error." });
    }
  });

  // -----------------------------------------------------
  // GET ALL USERS (DEV ONLY)
  // -----------------------------------------------------
  router.get("/", (req, res) => {
    try {
      const users = readJson(usersFile);
      const safeUsers = users.map(({ password, ...rest }) => rest);
      res.json(safeUsers);
    } catch (error) {
      console.error("GET USERS ERROR:", error);
      res.status(500).json({ message: "Server error." });
    }
  });
export default router;
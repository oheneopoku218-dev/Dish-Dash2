import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const file = path.join(process.cwd(), "data", "Dinner.json");

function ensureFile() {
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, "[]", "utf8");
  }
}

function readJson() {
  ensureFile();
  return JSON.parse(fs.readFileSync(file, "utf8") || "[]");
}

function writeJson(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

router.get("/", (req, res) => {
  res.json(readJson());
});

router.post("/", (req, res) => {
  const items = readJson();
  const newItem = { id: Date.now(), ...req.body };
  items.push(newItem);
  writeJson(items);
  res.status(201).json(newItem);
});

export default router;

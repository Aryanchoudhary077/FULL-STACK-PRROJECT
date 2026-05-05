require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/todolist";
const JWT_SECRET = process.env.JWT_SECRET || "dev_only_change_me";

app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const TodoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    task: { type: String, required: true, trim: true },
    category: { type: String, required: true, default: "General", trim: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
const Todo = mongoose.model("Todo", TodoSchema);

function authRequired(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body ?? {};
    if (typeof username !== "string" || !username.trim()) {
      return res.status(400).json({ message: "Username is required" });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ username: username.trim() });
    if (existing) return res.status(409).json({ message: "Username already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username: username.trim(), passwordHash });
    const token = jwt.sign({ userId: user._id.toString(), username: user.username }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: { username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to register" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body ?? {};
    if (typeof username !== "string" || !username.trim()) {
      return res.status(400).json({ message: "Username is required" });
    }
    if (typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findOne({ username: username.trim() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id.toString(), username: user.username }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: { username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to login" });
  }
});

app.get("/me", authRequired, (req, res) => {
  res.json({ user: { username: req.user.username } });
});

app.get("/todos", authRequired, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load todos" });
  }
});

app.post("/todos", authRequired, async (req, res) => {
  try {
    const raw = req.body?.task;
    if (typeof raw !== "string" || !raw.trim()) {
      return res.status(400).json({ message: "Task is required" });
    }
    const validCategories = ["Sports", "Computer", "Study", "Workout", "General"];
    const rawCategory = req.body?.category;
    const category =
      typeof rawCategory === "string" && validCategories.includes(rawCategory)
        ? rawCategory
        : "General";

    const task = raw.trim();
    const newTodo = new Todo({ userId: req.user.userId, task, category });
    await newTodo.save();
    const todos = await Todo.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create todo" });
  }
});

app.patch("/todos/:id", authRequired, async (req, res) => {
  try {
    const raw = req.body?.task;
    if (typeof raw !== "string" || !raw.trim()) {
      return res.status(400).json({ message: "Task is required" });
    }
    const validCategories = ["Sports", "Computer", "Study", "Workout", "General", "college"];
    const rawCategory = req.body?.category;
    const category =
      typeof rawCategory === "string" && validCategories.includes(rawCategory)
        ? rawCategory
        : "General";

    const updated = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { task: raw.trim(), category },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Todo not found" });
    }

    const todos = await Todo.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid todo id" });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to update todo" });
  }
});

app.delete("/todos/:id", authRequired, async (req, res) => {
  try {
    const deleted = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!deleted) {
      return res.status(404).json({ message: "Todo not found" });
    }
    const todos = await Todo.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid todo id" });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to delete todo" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

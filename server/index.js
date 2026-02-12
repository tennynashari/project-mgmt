import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import dashboardRoutes from "./routes/dashboard.js";
import taskRoutes from "./routes/tasks.js";
import userRoutes from "./routes/users.js";
import commentRoutes from "./routes/comments.js";
import activityRoutes from "./routes/activities.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/activities", activityRoutes);

app.get("/", (req, res) => {
  res.json({ message: "PM API running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

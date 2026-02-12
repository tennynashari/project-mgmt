import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";
import { roleMiddleware } from "../middleware/role.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get all tasks
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { projectId, status, assigneeId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    
    if (projectId) where.projectId = parseInt(projectId);
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = parseInt(assigneeId);

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit)
      }),
      prisma.task.count({ where })
    ]);

    res.json({
      data: tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single task
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        comments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" }
        }
      }
    });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create task
router.post("/", authMiddleware, roleMiddleware(["PM", "Admin"]), async (req, res) => {
  try {
    const { projectId, title, description, status, priority, assigneeId, startDate, dueDate, progress } = req.body;
    
    const task = await prisma.task.create({
      data: {
        projectId: parseInt(projectId),
        title,
        description,
        status: status || "To Do",
        priority: priority || "Medium",
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        progress: progress || 0
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } }
      }
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task
router.put("/:id", authMiddleware, roleMiddleware(["PM", "Admin"]), async (req, res) => {
  try {
    const { title, description, status, priority, assigneeId, startDate, dueDate, progress } = req.body;
    
    const task = await prisma.task.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title,
        description,
        status,
        priority,
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        progress: progress !== undefined ? progress : undefined
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } }
      }
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete task
router.delete("/:id", authMiddleware, roleMiddleware(["PM", "Admin"]), async (req, res) => {
  try {
    await prisma.task.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";
import { roleMiddleware } from "../middleware/role.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get all projects
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = status ? { status } : {};

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          tasks: {
            select: {
              status: true,
              progress: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit)
      }),
      prisma.project.count({ where })
    ]);

    // Calculate stats for each project
    const projectsWithStats = projects.map(project => {
      const tasks = project.tasks;
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === "Done").length;
      const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;
      const todoTasks = tasks.filter(t => t.status === "To Do").length;
      const reviewTasks = tasks.filter(t => t.status === "Review").length;
      
      // Calculate average progress
      const avgProgress = totalTasks > 0 
        ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks)
        : 0;

      return {
        ...project,
        stats: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          reviewTasks,
          avgProgress
        },
        tasks: undefined // Don't send full tasks array
      };
    });

    res.json({
      data: projectsWithStats,
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

// Create project
router.post("/", authMiddleware, roleMiddleware(["PM", "Admin"]), async (req, res) => {
  try {
    const { name, description, status, startDate, endDate } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || "Planning",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        ownerId: req.userId
      }
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update project
router.put("/:id", authMiddleware, roleMiddleware(["PM", "Admin"]), async (req, res) => {
  try {
    const { name, description, status, startDate, endDate } = req.body;
    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        description,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete project
router.delete("/:id", authMiddleware, roleMiddleware(["PM", "Admin"]), async (req, res) => {
  try {
    await prisma.project.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

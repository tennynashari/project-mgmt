import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const activeProjects = await prisma.project.count({
      where: { status: { in: ["Planning", "Ongoing"] } }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTasks = await prisma.task.count({
      where: {
        dueDate: { gte: today, lt: tomorrow }
      }
    });

    const overdueTasks = await prisma.task.count({
      where: {
        dueDate: { lt: today },
        status: { not: "Done" }
      }
    });

    // Get status distribution
    const allTasks = await prisma.task.findMany({
      select: { status: true }
    });

    const statusDistribution = {
      todo: allTasks.filter(t => t.status === "To Do").length,
      inProgress: allTasks.filter(t => t.status === "In Progress").length,
      review: allTasks.filter(t => t.status === "Review").length,
      done: allTasks.filter(t => t.status === "Done").length
    };

    // Get project progress
    const projects = await prisma.project.findMany({
      where: { status: { in: ["Planning", "Ongoing"] } },
      include: {
        tasks: {
          select: { progress: true }
        }
      },
      take: 5,
      orderBy: { updatedAt: "desc" }
    });

    const projectProgress = projects.map(p => {
      const tasks = p.tasks;
      const avgProgress = tasks.length > 0 
        ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length)
        : 0;
      
      return {
        id: p.id,
        name: p.name,
        progress: avgProgress,
        taskCount: tasks.length
      };
    });

    res.json({ 
      activeProjects, 
      todayTasks, 
      overdueTasks,
      statusDistribution,
      projectProgress
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get activity logs
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { projectId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // For now, we'll create activity log from comments and task changes
    // This is a simplified version - in production you'd have a dedicated ActivityLog table
    
    const [comments, tasks] = await Promise.all([
      prisma.comment.findMany({
        where: projectId ? {
          task: { projectId: parseInt(projectId) }
        } : undefined,
        include: {
          user: { select: { id: true, name: true } },
          task: { select: { id: true, title: true, projectId: true, project: { select: { name: true } } } }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.task.findMany({
        where: projectId ? { projectId: parseInt(projectId) } : undefined,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } }
        },
        orderBy: { updatedAt: "desc" }
      })
    ]);

    // Combine and format activities
    const allActivities = [
      ...comments.map(c => ({
        id: `comment-${c.id}`,
        type: "comment",
        message: `${c.user.name} commented on "${c.task.title}"`,
        detail: c.message,
        user: c.user.name,
        project: c.task.project.name,
        timestamp: c.createdAt
      })),
      ...tasks.map(t => ({
        id: `task-${t.id}`,
        type: "task_update",
        message: `Task "${t.title}" updated`,
        detail: `Status: ${t.status}${t.assignee ? ` | Assigned to: ${t.assignee.name}` : ''}`,
        user: t.assignee?.name || "System",
        project: t.project.name,
        timestamp: t.updatedAt
      }))
    ];

    // Sort by timestamp
    allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply pagination
    const total = allActivities.length;
    const paginatedActivities = allActivities.slice(skip, skip + parseInt(limit));
    
    res.json({
      data: paginatedActivities,
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

export default router;

import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get comments for a task
router.get("/task/:taskId", authMiddleware, async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { taskId: parseInt(req.params.taskId) },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create comment
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { taskId, message } = req.body;
    
    const comment = await prisma.comment.create({
      data: {
        taskId: parseInt(taskId),
        userId: req.userId,
        message
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete comment
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only allow user to delete their own comment
    if (comment.userId !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.comment.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

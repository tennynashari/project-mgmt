import express from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";
import { roleMiddleware } from "../middleware/role.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get all users (for assignee dropdown)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { name: "asc" }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single user (PM only)
router.get("/:id", authMiddleware, roleMiddleware(["PM", "Admin"]), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create user (PM only)
router.post("/", authMiddleware, roleMiddleware(["PM", "Admin"]), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "Member"
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user (PM only)
router.put("/:id", authMiddleware, roleMiddleware(["PM", "Admin"]), async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    
    const updateData = { name, email, role };
    
    // Only update password if provided
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user (PM only)
router.delete("/:id", authMiddleware, roleMiddleware(["PM", "Admin"]), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Prevent deleting yourself
    if (userId === req.userId) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user info
router.get("/me/profile", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

export const roleMiddleware = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      
      console.log("RoleMiddleware - userId:", req.userId);
      console.log("RoleMiddleware - allowedRoles:", allowedRoles);
      
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { role: true }
      });

      console.log("RoleMiddleware - user found:", user);

      if (!user || !allowedRoles.includes(user.role)) {
        console.log("RoleMiddleware - Access denied for role:", user?.role);
        return res.status(403).json({ message: "Access denied. Insufficient permissions." });
      }

      req.userRole = user.role;
      next();
    } catch (err) {
      console.error("RoleMiddleware error:", err);
      res.status(500).json({ message: err.message });
    }
  };
};

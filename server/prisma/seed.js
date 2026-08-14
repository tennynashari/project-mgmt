import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const userAdmin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "Admin"
    }
  });

  const user1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      password: hashedPassword,
      role: "PM"
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "jane@example.com",
      password: hashedPassword,
      role: "Member"
    }
  });

  const user3 = await prisma.user.create({
    data: {
      name: "Bob Wilson",
      email: "bob@example.com",
      password: hashedPassword,
      role: "Member"
    }
  });

  console.log("✅ Created 4 users (Admin, PM, Members)");

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Redesign company website with modern UI/UX",
      status: "Ongoing",
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-03-30"),
      ownerId: user1.id
    }
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Mobile App Development",
      description: "Build cross-platform mobile application",
      status: "Planning",
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-06-15"),
      ownerId: user1.id
    }
  });

  const project3 = await prisma.project.create({
    data: {
      name: "API Integration",
      description: "Integrate third-party payment gateway",
      status: "Ongoing",
      startDate: new Date("2026-01-20"),
      endDate: new Date("2026-02-28"),
      ownerId: user1.id
    }
  });

  const project4 = await prisma.project.create({
    data: {
      name: "Database Migration",
      description: "Migrate from MySQL to PostgreSQL",
      status: "Completed",
      startDate: new Date("2025-12-01"),
      endDate: new Date("2026-01-15"),
      ownerId: user1.id
    }
  });

  const project5 = await prisma.project.create({
    data: {
      name: "Marketing Campaign",
      description: "Q1 2026 digital marketing campaign",
      status: "Archived",
      startDate: new Date("2025-11-01"),
      endDate: new Date("2025-12-31"),
      ownerId: user1.id
    }
  });

  console.log("✅ Created 5 projects");

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Design homepage mockup",
      description: "Create high-fidelity mockup for new homepage",
      status: "Done",
      priority: "High",
      assigneeId: user2.id,
      startDate: new Date("2026-01-29"),
      dueDate: new Date("2026-02-05"),
      progress: 100
    }
  });

  const task2 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Implement responsive header",
      description: "Code responsive navigation header with mobile menu",
      status: "In Progress",
      priority: "High",
      assigneeId: user3.id,
      startDate: new Date("2026-02-03"),
      dueDate: new Date("2026-02-10"),
      progress: 60
    }
  });

  const task3 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Setup analytics tracking",
      description: "Integrate Google Analytics and heatmap tools",
      status: "To Do",
      priority: "Medium",
      assigneeId: user2.id,
      startDate: new Date("2026-02-12"),
      dueDate: new Date("2026-02-15"),
      progress: 0
    }
  });

  const task4 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: "Research cross-platform frameworks",
      description: "Compare React Native vs Flutter",
      status: "Done",
      priority: "High",
      assigneeId: user2.id,
      dueDate: new Date("2026-02-03"),
      progress: 100
    }
  });

  const task5 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: "Setup development environment",
      description: "Install and configure React Native toolchain",
      status: "In Progress",
      priority: "High",
      assigneeId: user3.id,
      dueDate: new Date("2026-02-08"),
      progress: 75
    }
  });

  const task6 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: "Create app architecture diagram",
      description: "Design overall application architecture",
      status: "To Do",
      priority: "Medium",
      assigneeId: user2.id,
      dueDate: new Date("2026-02-12"),
      progress: 0
    }
  });

  const task7 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: "Review payment gateway documentation",
      description: "Study Stripe API documentation",
      status: "Done",
      priority: "High",
      assigneeId: user3.id,
      dueDate: new Date("2026-01-25"),
      progress: 100
    }
  });

  const task8 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: "Implement payment endpoint",
      description: "Create API endpoint for payment processing",
      status: "In Progress",
      priority: "High",
      assigneeId: user3.id,
      dueDate: new Date("2026-02-08"),
      progress: 40
    }
  });

  const task9 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: "Write integration tests",
      description: "Create unit and integration tests for payment flow",
      status: "To Do",
      priority: "Medium",
      assigneeId: user2.id,
      dueDate: new Date("2026-02-20"),
      progress: 0
    }
  });

  // Task overdue for today's date (Feb 8, 2026)
  const task10 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Fix mobile menu bug",
      description: "Menu not closing on mobile devices",
      status: "To Do",
      priority: "High",
      assigneeId: user3.id,
      dueDate: new Date("2026-02-07"), // Yesterday - overdue!
      progress: 0
    }
  });

  // Task for today
  const task11 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: "Review security audit",
      description: "Review payment security audit results",
      status: "In Progress",
      priority: "High",
      assigneeId: user2.id,
      dueDate: new Date("2026-02-08"), // Today!
      progress: 30
    }
  });

  console.log("✅ Created 11 tasks");

  // Create comments
  await prisma.comment.create({
    data: {
      taskId: task1.id,
      userId: user1.id,
      message: "Great work on the mockup! Design looks modern and clean."
    }
  });

  await prisma.comment.create({
    data: {
      taskId: task2.id,
      userId: user1.id,
      message: "Please ensure mobile menu works on all screen sizes."
    }
  });

  await prisma.comment.create({
    data: {
      taskId: task2.id,
      userId: user3.id,
      message: "Will do! Currently testing on iPhone and Android devices."
    }
  });

  await prisma.comment.create({
    data: {
      taskId: task5.id,
      userId: user2.id,
      message: "Environment setup almost complete. Just need to configure iOS simulator."
    }
  });

  await prisma.comment.create({
    data: {
      taskId: task8.id,
      userId: user1.id,
      message: "Make sure to handle all error cases properly."
    }
  });

  console.log("✅ Created 5 comments");

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\nTest credentials:");
  console.log("Email: admin@example.com | Password: password123 (Admin)");
  console.log("Email: john@example.com  | Password: password123 (PM)");
  console.log("Email: jane@example.com  | Password: password123 (Member)");
  console.log("Email: bob@example.com   | Password: password123 (Member)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

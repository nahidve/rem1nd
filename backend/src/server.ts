import "dotenv/config";
import "./config/firebase.js";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

import { processDueReminders } from "./jobs/reminder.job.js";

import routes from "./routes/index.js";

import { notFound } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/v1/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "OK",
  });
});

app.use("/api/v1", routes);
app.use(notFound);
app.use(errorHandler);

const PORT = env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  await prisma.$connect();
  console.log("Connected to database");

  // START BACKGROUND JOB
  setInterval(() => {
    processDueReminders();
  }, 60 * 1000);
});

const signals = ["SIGTERM", "SIGINT", "SIGHUP"];

signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`Received ${signal}`);
    server.close();
    await prisma.$disconnect();
    console.log("Server closed");
    process.exit(0);
  });
});

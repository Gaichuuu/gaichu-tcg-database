import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import { corsMiddleware } from "./config/index.js";
import { errorHandler, notFoundHandler } from "./middleware/index.js";
import routes from "./routes/index.js";

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  res.json({
    name: "Gaichu Card API",
    version: "1.0.0",
    documentation: "https://github.com/gaichu/api-docs",
    endpoints: {
      cards: "/v1/cards",
      series: "/v1/series",
      sets: "/v1/sets",
      illustrators: "/v1/illustrators",
      rarity: "/v1/rarity",
      stats: "/v1/stats",
    },
  });
});

// API routes
app.use("/v1", routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Export the Express app as a Firebase Cloud Function
export const api = onRequest(
  {
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  app,
);

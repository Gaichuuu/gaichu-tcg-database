import cors from "cors";

export const corsOptions: cors.CorsOptions = {
  origin: true,
  methods: ["GET", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept"],
  maxAge: 86400,
};

export const corsMiddleware = cors(corsOptions);

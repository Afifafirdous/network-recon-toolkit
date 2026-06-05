import dns from "dns";

dns.setServers([
  "1.1.1.1",      // Cloudflare primary
  "1.0.0.1",      // Cloudflare secondary
  "8.8.8.8",      // Google primary
  "8.8.4.4",      // Google secondary
]);

import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import ipRouter from "./routes/ip.route";
import domainRouter from "./routes/domain.route";
import dnsRouter from "./routes/dns.route";
import asnRouter from "./routes/asn.route";
import { errorHandler } from "./middleware/errorHandler";
import { globalRateLimiter } from "./middleware/rateLimiter";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security middleware ──────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://your-domain.com"
        : "http://localhost:5173",
    methods: ["GET"],
  })
);
app.use(express.json());
app.use(globalRateLimiter);

// ── Routes ───────────────────────────────────────────────────────
app.use("/api/ip", ipRouter);
app.use("/api/domain", domainRouter);
app.use("/api/dns", dnsRouter);
app.use("/api/asn", asnRouter);

// ── Health check ─────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 handler ──────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error handler ────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

export default app;
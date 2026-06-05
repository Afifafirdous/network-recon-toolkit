import { Router } from "express";
import { param, query } from "express-validator";
import { dnsLookupHandler } from "../controllers/dns.controller";
import { validate } from "../middleware/validator";
import { strictRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// GET /api/dns/:hostname?type=A
router.get(
  "/:hostname",
  strictRateLimiter,
  [
    param("hostname")
      .trim()
      .notEmpty()
      .withMessage("Hostname is required"),
    query("type")
      .optional()
      .isIn(["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA"])
      .withMessage("Invalid record type. Use: A, AAAA, MX, NS, TXT, CNAME, SOA"),
  ],
  validate,
  dnsLookupHandler
);

export default router;
import { Router } from "express";
import { param } from "express-validator";
import { asnLookupHandler } from "../controllers/asn.controller";
import { validate } from "../middleware/validator";
import { strictRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// GET /api/asn/:asn — e.g. /api/asn/AS15169
router.get(
  "/:asn",
  strictRateLimiter,
  [
    param("asn")
      .trim()
      .notEmpty()
      .withMessage("ASN is required")
      .matches(/^AS\d+$/i)
      .withMessage("Invalid ASN format. Use format: AS15169"),
  ],
  validate,
  asnLookupHandler
);

export default router;
import { Router } from "express";
import { param } from "express-validator";
import { domainToIPHandler } from "../controllers/domain.controller";
import { validate } from "../middleware/validator";
import { strictRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// GET /api/domain/:hostname — resolve domain to IP then lookup
router.get(
  "/:hostname",
  strictRateLimiter,
  [
    param("hostname")
      .trim()
      .notEmpty()
      .withMessage("Hostname is required")
      .matches(/^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/)
      .withMessage("Invalid hostname format"),
  ],
  validate,
  domainToIPHandler
);

export default router;
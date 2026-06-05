import { Router } from "express";
import { param, query } from "express-validator";
import {
  lookupIPHandler,
  getMyIPHandler,
} from "../controllers/ip.controller";
import { validate } from "../middleware/validator";
import { strictRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// GET /api/ip/me — detect caller's own IP
router.get("/me", strictRateLimiter, getMyIPHandler);

// GET /api/ip/:address — lookup specific IP
router.get(
  "/:address",
  strictRateLimiter,
  [
    param("address")
      .trim()
      .notEmpty()
      .withMessage("IP address is required")
      .matches(
        /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^(?:[0-9a-fA-F]{1,4}:)*:(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/
      )
      .withMessage("Invalid IPv4 or IPv6 address"),
  ],
  validate,
  lookupIPHandler
);

export default router;
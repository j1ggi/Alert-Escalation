import express from "express";
import {
  createAlert,
  getAlerts,
  getAlert,
  resolveAlert,
  simulateFleet,
  getNotifications,
} from "../controllers/alertController.js";

const router = express.Router();

router.post("/", createAlert);
router.post("/simulate", simulateFleet);
router.get("/notifications", getNotifications);
router.get("/", getAlerts);
router.get("/:alertId", getAlert);
router.patch("/:alertId/resolve", resolveAlert);

export default router;
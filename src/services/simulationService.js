import { createAlertService } from "./alertService.js";
import logger from "../config/logger.js";

/**
 * Pre-defined realistic fleet operational event presets
 */
const SIMULATED_SCENARIOS = [
  // Driver D-102: 3 overspeed events to trigger speed escalation threshold
  {
    driverId: "D-102",
    sourceType: "overspeed",
    message: "GPS sensor detected 88 km/h in 60 km/h city zone (Downtown Ave).",
  },
  {
    driverId: "D-102",
    sourceType: "overspeed",
    message: "GPS sensor detected 95 km/h on Expressway exit ramp.",
  },
  {
    driverId: "D-102",
    sourceType: "overspeed",
    message: "GPS sensor detected 106 km/h on Ring Road sector 4.",
  },

  // Driver D-105: 2 negative customer feedbacks to trigger feedback escalation
  {
    driverId: "D-105",
    sourceType: "feedback_negative",
    message: "Customer reported reckless overtaking and sudden harsh braking.",
  },
  {
    driverId: "D-105",
    sourceType: "feedback_negative",
    message: "Customer reported discourteous verbal altercation during package drop-off.",
  },

  // Driver D-101: 1 single overspeed event (remains OPEN)
  {
    driverId: "D-101",
    sourceType: "overspeed",
    message: "GPS sensor detected 78 km/h in 70 km/h commercial zone.",
  },

  // Driver D-103: Compliance failure event
  {
    driverId: "D-103",
    sourceType: "compliance",
    message: "Commercial vehicle annual fitness certificate expired on 2026-11-10.",
  },
];

/**
 * Execute a fleet event simulation burst
 */
export const runFleetSimulation = async (options = {}) => {
  const { eventCount = 7 } = options;
  const eventsToRun = SIMULATED_SCENARIOS.slice(0, Math.min(eventCount, SIMULATED_SCENARIOS.length));

  logger.info(`Starting fleet simulation run with ${eventsToRun.length} events...`);

  const createdAlerts = [];
  let escalatedCount = 0;

  for (const event of eventsToRun) {
    // Artificial small delay between events to simulate real incoming stream
    await new Promise((resolve) => setTimeout(resolve, 80));

    try {
      const alert = await createAlertService(event);
      createdAlerts.push(alert);

      if (alert.status === "ESCALATED") {
        escalatedCount += 1;
      }
    } catch (err) {
      logger.error(`Simulation event failed for Driver ${event.driverId}: ${err.message}`);
    }
  }

  const summary = `Simulated ${createdAlerts.length} fleet events across ${
    new Set(createdAlerts.map((a) => a.driverId)).size
  } drivers. ${escalatedCount} alert(s) escalated to CRITICAL with multi-channel notifications dispatched.`;

  logger.info(`Fleet simulation finished. ${summary}`);

  return {
    totalGenerated: createdAlerts.length,
    escalatedCount,
    summary,
    alerts: createdAlerts,
  };
};


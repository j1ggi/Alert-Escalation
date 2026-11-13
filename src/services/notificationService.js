import logger from "../config/logger.js";

// In-memory ring buffer for the most recent 20 notifications (accessible via API / UI)
const notificationHistory = [];
const MAX_HISTORY = 20;

/**
 * Format payload for Discord Webhook
 */
const formatDiscordPayload = (alert, summaryText) => {
  return {
    content: summaryText,
    embeds: [
      {
        title: "🚨 Alert Escalation Triggered",
        description: alert.escalationReason || alert.message || "Threshold breached",
        color: 0xe74c3c, // Vivid red
        fields: [
          { name: "Driver ID", value: `\`${alert.driverId}\``, inline: true },
          { name: "Source Type", value: alert.sourceType, inline: true },
          { name: "Severity", value: alert.severity, inline: true },
          { name: "Current Status", value: alert.status, inline: true },
          { name: "Alert ID", value: `\`${alert.alertId}\``, inline: false },
        ],
        footer: {
          text: "Intelligent Alert Escalation System",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
};

/**
 * Format payload for Slack Webhook
 */
const formatSlackPayload = (alert, summaryText) => {
  return {
    text: summaryText,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🚨 Alert Escalation Triggered",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${summaryText}*\n\n*Reason:* ${alert.escalationReason || alert.message}`,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Driver:* \`${alert.driverId}\`` },
          { type: "mrkdwn", text: `*Severity:* *${alert.severity}*` },
          { type: "mrkdwn", text: `*Source:* \`${alert.sourceType}\`` },
          { type: "mrkdwn", text: `*Status:* \`${alert.status}\`` },
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Alert ID: \`${alert.alertId}\` | Timestamp: ${new Date().toISOString()}`,
          },
        ],
      },
    ],
  };
};

/**
 * Dispatches notification to all configured channels (Slack, Discord, generic Webhook, and local log)
 */
export const dispatchEscalationNotification = async (alert) => {
  const summaryText = `🚨 Critical Escalation: Driver ${alert.driverId} triggered escalation (${alert.sourceType}). ${alert.escalationReason || alert.message}`;

  const notificationRecord = {
    id: alert.alertId,
    driverId: alert.driverId,
    sourceType: alert.sourceType,
    severity: alert.severity,
    status: alert.status,
    summary: summaryText,
    reason: alert.escalationReason || alert.message,
    timestamp: new Date().toISOString(),
    dispatchedTo: [],
  };

  const discordUrl = process.env.DISCORD_WEBHOOK_URL;
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  const genericUrl = process.env.WEBHOOK_URL;

  const dispatchPromises = [];

  // 1. Discord Webhook
  if (discordUrl) {
    dispatchPromises.push(
      (async () => {
        try {
          const res = await fetch(discordUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formatDiscordPayload(alert, summaryText)),
            signal: AbortSignal.timeout(5000),
          });
          if (res.ok) {
            notificationRecord.dispatchedTo.push("Discord");
            logger.info(`Discord webhook delivered for alert ${alert.alertId}`);
          } else {
            logger.warn(`Discord webhook returned HTTP ${res.status}`);
          }
        } catch (err) {
          logger.warn(`Discord webhook delivery failed: ${err.message}`);
        }
      })()
    );
  }

  // 2. Slack Webhook
  if (slackUrl) {
    dispatchPromises.push(
      (async () => {
        try {
          const res = await fetch(slackUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formatSlackPayload(alert, summaryText)),
            signal: AbortSignal.timeout(5000),
          });
          if (res.ok) {
            notificationRecord.dispatchedTo.push("Slack");
            logger.info(`Slack webhook delivered for alert ${alert.alertId}`);
          } else {
            logger.warn(`Slack webhook returned HTTP ${res.status}`);
          }
        } catch (err) {
          logger.warn(`Slack webhook delivery failed: ${err.message}`);
        }
      })()
    );
  }

  // 3. Generic Webhook
  if (genericUrl) {
    dispatchPromises.push(
      (async () => {
        try {
          const res = await fetch(genericUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "alert.escalated",
              summary: summaryText,
              alert,
              timestamp: new Date().toISOString(),
            }),
            signal: AbortSignal.timeout(5000),
          });
          if (res.ok) {
            notificationRecord.dispatchedTo.push("Generic Webhook");
            logger.info(`Generic webhook delivered for alert ${alert.alertId}`);
          } else {
            logger.warn(`Generic webhook returned HTTP ${res.status}`);
          }
        } catch (err) {
          logger.warn(`Generic webhook delivery failed: ${err.message}`);
        }
      })()
    );
  }

  // Await all remote webhooks asynchronously (non-blocking for the caller)
  await Promise.allSettled(dispatchPromises);

  // Always record to local log channel
  notificationRecord.dispatchedTo.push("Local Logger");

  // Keep in-memory ring buffer for UI dashboard
  notificationHistory.unshift(notificationRecord);
  if (notificationHistory.length > MAX_HISTORY) {
    notificationHistory.pop();
  }

  // Prominent console output for developer visibility
  const separator = "=".repeat(70);
  console.log(`\n${separator}`);
  console.log(`🚨 [MULTI-CHANNEL NOTIFICATION DISPATCHED]`);
  console.log(`Summary  : ${summaryText}`);
  console.log(`Driver   : ${alert.driverId}`);
  console.log(`Severity : ${alert.severity}`);
  console.log(`Alert ID : ${alert.alertId}`);
  console.log(`Channels : ${notificationRecord.dispatchedTo.join(", ")}`);
  console.log(`${separator}\n`);

  return notificationRecord;
};

/**
 * Retrieve recent notification history
 */
export const getRecentNotifications = () => {
  return [...notificationHistory];
};

/**
 * Get configured notification channel statuses
 */
export const getNotificationChannelsConfig = () => {
  return {
    discordConfigured: Boolean(process.env.DISCORD_WEBHOOK_URL),
    slackConfigured: Boolean(process.env.SLACK_WEBHOOK_URL),
    webhookConfigured: Boolean(process.env.WEBHOOK_URL),
    localLogger: true,
  };
};


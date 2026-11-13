import React from "react";

const NotificationCenter = ({ notifications = [], channels = {} }) => {
  return (
    <div className="card notification-card">
      <div className="notification-header">
        <div>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <span>📡</span> Multi-Channel Notification Center (Slack / Discord / Webhook)
          </h3>
          <p className="notification-sub">
            Real-time broadcast log for CRITICAL alert escalations dispatched to external webhooks.
          </p>
        </div>

        <div className="channel-pills">
          <span
            className={`channel-pill ${channels.discordConfigured ? "configured" : "fallback"}`}
            title={channels.discordConfigured ? "Discord webhook configured" : "Configurable via DISCORD_WEBHOOK_URL in .env"}
          >
            <span className="dot"></span> Discord Webhook: {channels.discordConfigured ? "Online" : "Mock/Local"}
          </span>

          <span
            className={`channel-pill ${channels.slackConfigured ? "configured" : "fallback"}`}
            title={channels.slackConfigured ? "Slack webhook configured" : "Configurable via SLACK_WEBHOOK_URL in .env"}
          >
            <span className="dot"></span> Slack Webhook: {channels.slackConfigured ? "Online" : "Mock/Local"}
          </span>

          <span className="channel-pill configured" title="Winston console & file logger">
            <span className="dot"></span> Console & Server Log: Active
          </span>
        </div>
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="notification-list">
          {notifications.map((notif, index) => (
            <div key={notif.id || index} className="notification-item">
              <div className="notif-top">
                <span className="notif-badge">CRITICAL ESCALATION</span>
                <span className="notif-time">
                  {notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString() : "Just now"}
                </span>
              </div>

              <div className="notif-summary">{notif.summary}</div>

              <div className="notif-footer">
                <div className="notif-meta">
                  <span><strong>Driver:</strong> {notif.driverId}</span>
                  <span><strong>Source:</strong> {notif.sourceType}</span>
                </div>

                <div className="notif-channels">
                  <span className="notif-dispatched-label">Dispatched to:</span>
                  {(notif.dispatchedTo || ["Local Logger"]).map((ch, i) => (
                    <span key={i} className="channel-tag">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-notifications">
          <p>
            No critical escalations dispatched yet. Click <strong>"⚡ Run Fleet Simulation"</strong> above to trigger threshold breaches and watch notifications fire here in real time!
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;


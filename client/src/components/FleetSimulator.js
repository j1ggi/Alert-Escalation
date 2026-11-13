import React, { useState } from "react";

const FleetSimulator = ({ onRunSimulation }) => {
  const [running, setRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const handleSimulate = async () => {
    setRunning(true);
    setSimulationResult(null);
    try {
      const result = await onRunSimulation();
      setSimulationResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="card simulation-card">
      <div className="simulation-header">
        <div>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="sim-icon">⚡</span> Fleet Event Simulation Engine
          </h3>
          <p className="simulation-desc">
            Automatically fire a realistic burst of fleet operational events (multiple overspeeds,
            customer negative feedback, and compliance checks) to demonstrate threshold breaches,
            real-time state transitions to <strong>CRITICAL</strong>, and automatic webhook dispatches.
          </p>
        </div>
        <button
          className="btn btn-simulate"
          onClick={handleSimulate}
          disabled={running}
        >
          {running ? (
            <span className="spinner-text">
              <span className="spin-icon">⏳</span> Simulating Fleet Events...
            </span>
          ) : (
            "⚡ Run Fleet Simulation (7 Events)"
          )}
        </button>
      </div>

      {simulationResult && (
        <div className="simulation-banner">
          <div className="sim-banner-title">
            ✅ Simulation Completed
          </div>
          <div className="sim-banner-body">
            {simulationResult.summary}
          </div>
          <div className="sim-stats">
            <span className="sim-badge events">
              Events Created: {simulationResult.totalGenerated}
            </span>
            <span className="sim-badge escalated">
              Escalated to Critical: {simulationResult.escalatedCount}
            </span>
            <span className="sim-badge webhook">
              Notifications Dispatched 🚨
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetSimulator;


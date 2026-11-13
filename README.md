# Intelligent Alert Escalation and Resolution System

## Overview
A rule-driven alert lifecycle management backend built with Node.js, Express, MongoDB, and Redis. It processes operational events, evaluates escalation thresholds, manages state transitions, and supports dashboard analytics.

## Tech Stack
- Backend: Node.js (ES Modules), Express.js, MongoDB (Mongoose), Redis, node-cron
- Frontend: React, Chart.js, Axios
- Logging & Utilities: Winston logger, UUID

## Alert State Machine
Alerts transition through defined lifecycle states:
- OPEN: Initial state on alert creation.
- ESCALATED: Promoted state when threshold rules are breached.
- RESOLVED: Terminal state when manually resolved by an analyst.
- AUTO_CLOSED: Closed automatically by background compliance or expiry jobs.

## Escalation Rules
Rules are configured in `src/config/rules.json`:
- Overspeed: Escalates if count reaches 3 within 60 minutes.
- Negative Feedback: Escalates if count reaches 2 within 24 hours.
- Compliance: Validates document status and auto-closes on compliance.

## API Endpoints

### Alert Endpoints
- POST /api/v1/alerts - Create a new alert
- POST /api/v1/alerts/simulate - Run realistic fleet simulation burst
- GET /api/v1/alerts/notifications - Fetch recent webhook notification dispatches
- GET /api/v1/alerts - List recent alerts
- GET /api/v1/alerts/:alertId - Fetch alert by ID
- PATCH /api/v1/alerts/:alertId/resolve - Resolve an alert

### Dashboard Endpoints
- GET /api/v1/dashboard - Full aggregated dashboard payload (metrics, escalated alerts, recent alerts, top drivers, notification feed)
- GET /api/v1/dashboard/summary - Severity distribution summary
- GET /api/v1/dashboard/top-drivers - Drivers with highest alert counts
- GET /api/v1/dashboard/trends - Alert trend analytics
- GET /api/v1/dashboard/recent-auto-closed - Recent auto-closed alerts
- GET /api/v1/dashboard/rules - Active rule configurations

## Key Features

### 1. Multi-Channel Webhook Notifications
Whenever an alert breaches threshold rules and escalates to **CRITICAL**, the system dispatches notifications across configured channels:
- **Discord Webhooks**: Rich embed format with color codes, timestamps, driver metadata, and escalation reasoning.
- **Slack Webhooks**: Formatted Block Kit message with markdown alerts.
- **Generic Webhook**: JSON event payload (`alert.escalated`).
- **Local Console Logger**: Formatted incident box logged with high visibility for offline/development testing.

### 2. Interactive Fleet Simulation Engine
- Test the escalation lifecycle with one click from the UI via the **"⚡ Run Fleet Simulation"** button or `POST /api/v1/alerts/simulate`.
- Fires realistic event bursts across multiple drivers (`D-102`, `D-105`, `D-101`, `D-103`).
- Simulates rapid consecutive overspeed violations and customer complaints that breach thresholds and trigger immediate critical escalations.

## Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local `mongod` service or a MongoDB Atlas connection string)
- **Redis** (*Optional* — system falls back to MongoDB if Redis is unavailable)

## Setup and Installation

### 1. Environment Configuration
A `.env` file is required in the root directory. An example `.env` file has been provided:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/alert-db
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Optional: Multi-Channel Webhook Notifications
# DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
# SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
# WEBHOOK_URL=https://your-custom-webhook-endpoint.com
```
> **Note for MongoDB Atlas users**: Replace `MONGO_URI` with your connection string (e.g. `mongodb+srv://<username>:<password>@cluster0.mongodb.net/alert-db?retryWrites=true&w=majority`).

### 2. Start the Backend Server (Terminal 1)
From the project root:
```bash
# Install backend dependencies
npm install

# Start backend in development mode (with hot reloading via nodemon)
npm run dev

# Or start in production mode
npm start
```
The backend will run on **http://localhost:5000**. You can test health at **http://localhost:5000/health**.

### 3. Start the Frontend Dashboard (Terminal 2)
Open a new terminal and navigate to the `client` directory:
```bash
cd client

# Install frontend dependencies
npm install

# Start React development server
npm start
```
The React frontend dashboard will open at **http://localhost:3000**.

# Financial Security Operations & Risk Monitoring Platform

## Overview

A cybersecurity monitoring platform designed to analyze simulated financial security events, identify suspicious activity, and support security operations.

The platform uses Python to calculate risk scores, PostgreSQL to store security data, FastAPI to provide backend APIs, and React to display security information through an interactive dashboard.

## Architecture

```text
Security Logs
      ↓
Python Risk Engine
      ↓
PostgreSQL Database
      ↓
FastAPI Backend
      ↓
React Dashboard
```

## Key Features

* Analyzes 10,000 simulated security events
* Calculates cybersecurity risk scores from security activity
* Classifies events as Low, Medium, High, or Critical
* Identifies suspicious login and data-transfer activity
* Monitors privileged account activity
* Tracks security incidents and investigation status
* Tracks vulnerabilities and remediation progress
* Provides an interactive security operations dashboard
* Maps security monitoring activities to the NIST Cybersecurity Framework

## Technology Stack

* **Python** — security log processing and risk scoring
* **Pandas** — security data analysis
* **PostgreSQL** — security event and vulnerability database
* **FastAPI** — REST API backend
* **React** — interactive dashboard
* **Vite** — frontend development environment
* **Recharts** — dashboard charts
* **Git/GitHub** — version control

## Risk Scoring

The Python risk engine assigns risk scores based on security indicators such as:

* Failed login attempts
* Privileged account activity
* Large data transfers
* Unusual locations
* Privilege changes
* Password reset activity
* File access activity

Risk levels are classified as:

| Risk Score | Risk Level |
| ---------- | ---------- |
| 0–29       | Low        |
| 30–59      | Medium     |
| 60–79      | High       |
| 80–100     | Critical   |

## Database

The PostgreSQL database contains tables for:

* Security events
* Security incidents
* Vulnerabilities
* NIST Cybersecurity Framework controls

## NIST Cybersecurity Framework

The project maps its security monitoring capabilities to the five NIST Cybersecurity Framework functions:

* **Identify** — assesses security risks and vulnerabilities
* **Protect** — monitors access and privileged activity
* **Detect** — identifies suspicious and high-risk security events
* **Respond** — tracks incidents and investigation status
* **Recover** — tracks vulnerability remediation and recovery activities

## Running the Project

### 1. Start PostgreSQL

Make sure PostgreSQL is running on the local machine.

### 2. Activate the virtual environment

```bash
source .venv/bin/activate
```

### 3. Generate security logs

```bash
python3 backend/generate_logs.py
```

### 4. Run the risk engine

```bash
python3 backend/risk_engine.py
```

### 5. Load the analyzed data

```bash
python3 -m backend.load_data
```

### 6. Start the FastAPI backend

```bash
uvicorn backend.main:app --reload
```

### 7. Start the React dashboard

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Project Structure

```text
financial-security-platform/
│
├── backend/
│   ├── __init__.py
│   ├── database.py
│   ├── generate_logs.py
│   ├── load_data.py
│   ├── main.py
│   └── risk_engine.py
│
├── data/
│   ├── security_logs.csv
│   └── analyzed_security_logs.csv
│
├── database/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── vite.config.js
│
├── tests/
│
├── .venv/
└── README.md
```

## Example Dashboard Metrics

The dashboard provides visibility into:

* Total security events
* Critical security events
* High-risk events
* Suspicious IP activity
* Open and investigated incidents
* Vulnerability severity
* Vulnerability remediation status
* NIST Cybersecurity Framework coverage

## Purpose

This project was developed as a hands-on cybersecurity and data engineering project to demonstrate skills in security monitoring, risk analysis, database management, API development, and security dashboard development.

## Dashboard Screenshots

### Security Operations Overview

![Security Operations Overview](screenshots/overview.png)

### Security Alerts

![Security Alerts](screenshots/security-alerts.png)

### Incident Review

![Incident Review](screenshots/incident-review.png)

### Incident Management

![Incident Management](screenshots/incident-management.png)

### Vulnerability Management

![Vulnerability Management](screenshots/vulnerability-management.png)

### NIST Cybersecurity Framework

![NIST Cybersecurity Framework](screenshots/nist-cyber.png)


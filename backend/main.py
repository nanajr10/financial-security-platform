from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.database import get_connection


app = FastAPI(
    title="Financial Security Operations Platform",
    description="Cybersecurity monitoring and risk analysis API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Financial Security Operations Platform API is running"
    }


# SECURITY METRICS
@app.get("/api/metrics")
def get_metrics():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM security_events;")
    total_events = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM security_events
        WHERE risk_level = 'Critical';
    """)
    critical_events = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM security_events
        WHERE risk_level = 'High';
    """)
    high_events = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(DISTINCT ip_address)
        FROM security_events
        WHERE risk_score >= 60;
    """)
    suspicious_ips = cursor.fetchone()[0]

    cursor.close()
    connection.close()

    return {
        "total_events": total_events,
        "critical_events": critical_events,
        "high_risk_events": high_events,
        "suspicious_ips": suspicious_ips
    }


# SECURITY EVENTS
@app.get("/api/events")
def get_events():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            event_id,
            timestamp,
            username,
            event_type,
            location,
            ip_address,
            failed_attempts,
            data_transferred_mb,
            privileged_account,
            risk_score,
            risk_level
        FROM security_events
        ORDER BY risk_score DESC
        LIMIT 100;
    """)

    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    events = []

    for row in rows:

        risk_factors = []

        if row[6] >= 3:
            risk_factors.append(
                f"{row[6]} failed login attempts"
            )

        if row[7] >= 1000:
            risk_factors.append(
                f"{row[7]} MB data transfer"
            )

        if row[8]:
            risk_factors.append(
                "Privileged account activity"
            )

        if row[3] == "Privilege Change":
            risk_factors.append(
                "Privilege change detected"
            )

        if row[4] in ["London", "California", "Texas"]:
            risk_factors.append(
                f"Unusual location: {row[4]}"
            )

        events.append({
            "event_id": row[0],
            "timestamp": str(row[1]),
            "username": row[2],
            "event_type": row[3],
            "location": row[4],
            "ip_address": row[5],
            "failed_attempts": row[6],
            "data_transferred_mb": row[7],
            "privileged_account": row[8],
            "risk_score": row[9],
            "risk_level": row[10],
            "risk_factors": risk_factors
        })

    return events


# INCIDENTS
@app.get("/api/incidents")
def get_incidents():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            incident_id,
            event_id,
            severity,
            description,
            status,
            created_at
        FROM incidents
        ORDER BY incident_id DESC;
    """)

    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    incidents = []

    for row in rows:
        incidents.append({
            "incident_id": row[0],
            "event_id": row[1],
            "severity": row[2],
            "description": row[3],
            "status": row[4],
            "created_at": str(row[5])
        })

    return incidents


# UPDATE INCIDENT STATUS
@app.put("/api/incidents/{incident_id}/status")
def update_incident_status(incident_id: int, status: str):

    allowed_statuses = [
        "Open",
        "Investigating",
        "Resolved"
    ]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid incident status."
        )

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE incidents
        SET status = %s
        WHERE incident_id = %s
        RETURNING incident_id, status;
    """, (status, incident_id))

    updated_incident = cursor.fetchone()

    if updated_incident is None:
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Incident not found."
        )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "incident_id": updated_incident[0],
        "status": updated_incident[1]
    }


# INCIDENT METRICS
@app.get("/api/incident-metrics")
def get_incident_metrics():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT COUNT(*)
        FROM incidents
        WHERE status = 'Open';
    """)
    open_incidents = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM incidents
        WHERE status = 'Investigating';
    """)
    investigating_incidents = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM incidents
        WHERE status = 'Resolved';
    """)
    resolved_incidents = cursor.fetchone()[0]

    cursor.close()
    connection.close()

    return {
        "open": open_incidents,
        "investigating": investigating_incidents,
        "resolved": resolved_incidents
    }


# VULNERABILITIES
@app.get("/api/vulnerabilities")
def get_vulnerabilities():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            vulnerability_id,
            system_name,
            vulnerability_name,
            severity,
            status,
            remediation_owner
        FROM vulnerabilities
        ORDER BY
            CASE severity
                WHEN 'Critical' THEN 1
                WHEN 'High' THEN 2
                WHEN 'Medium' THEN 3
                WHEN 'Low' THEN 4
            END,
            vulnerability_id DESC;
    """)

    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    vulnerabilities = []

    for row in rows:
        vulnerabilities.append({
            "vulnerability_id": row[0],
            "system_name": row[1],
            "vulnerability_name": row[2],
            "severity": row[3],
            "status": row[4],
            "remediation_owner": row[5]
        })

    return vulnerabilities


# VULNERABILITY METRICS
@app.get("/api/vulnerability-metrics")
def get_vulnerability_metrics():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT COUNT(*)
        FROM vulnerabilities
        WHERE severity = 'Critical';
    """)
    critical = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM vulnerabilities
        WHERE severity = 'High';
    """)
    high = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM vulnerabilities
        WHERE severity = 'Medium';
    """)
    medium = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM vulnerabilities
        WHERE status = 'Open';
    """)
    open_vulnerabilities = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM vulnerabilities
        WHERE status = 'In Progress';
    """)
    in_progress = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM vulnerabilities
        WHERE status = 'Resolved';
    """)
    resolved = cursor.fetchone()[0]

    cursor.close()
    connection.close()

    return {
        "critical": critical,
        "high": high,
        "medium": medium,
        "open": open_vulnerabilities,
        "in_progress": in_progress,
        "resolved": resolved
    }


# NIST CSF
@app.get("/api/nist")
def get_nist_controls():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            control_id,
            function,
            category,
            description,
            project_implementation
        FROM nist_controls
        ORDER BY control_id;
    """)

    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    controls = []

    for row in rows:
        controls.append({
            "control_id": row[0],
            "function": row[1],
            "category": row[2],
            "description": row[3],
            "project_implementation": row[4]
        })

    return controls
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

function App() {
  const [metrics, setMetrics] = useState(null);
  const [events, setEvents] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [incidentMetrics, setIncidentMetrics] = useState(null);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [vulnerabilityMetrics, setVulnerabilityMetrics] = useState(null);
  const [nistControls, setNistControls] = useState([]);

  const [riskFilter, setRiskFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/metrics")
      .then((response) => response.json())
      .then((data) => setMetrics(data));

    fetch("http://127.0.0.1:8000/api/events")
      .then((response) => response.json())
      .then((data) => setEvents(data));

    fetch("http://127.0.0.1:8000/api/incidents")
      .then((response) => response.json())
      .then((data) => setIncidents(data));

    fetch("http://127.0.0.1:8000/api/incident-metrics")
      .then((response) => response.json())
      .then((data) => setIncidentMetrics(data));

    fetch("http://127.0.0.1:8000/api/vulnerabilities")
      .then((response) => response.json())
      .then((data) => setVulnerabilities(data));

    fetch("http://127.0.0.1:8000/api/vulnerability-metrics")
      .then((response) => response.json())
      .then((data) => setVulnerabilityMetrics(data));

    fetch("http://127.0.0.1:8000/api/nist")
      .then((response) => response.json())
      .then((data) => setNistControls(data));
  }, []);

  const updateIncidentStatus = async (incidentId, newStatus) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/incidents/${incidentId}/status?status=${encodeURIComponent(
          newStatus
        )}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update incident.");
      }

      const updatedIncident = await response.json();

      setIncidents((currentIncidents) =>
        currentIncidents.map((incident) =>
          incident.incident_id === incidentId
            ? {
                ...incident,
                status: updatedIncident.status,
              }
            : incident
        )
      );

      setSelectedIncident((currentIncident) =>
        currentIncident
          ? {
              ...currentIncident,
              status: updatedIncident.status,
            }
          : null
      );

      const metricsResponse = await fetch(
        "http://127.0.0.1:8000/api/incident-metrics"
      );

      const updatedMetrics = await metricsResponse.json();

      setIncidentMetrics(updatedMetrics);
    } catch (error) {
      console.error("Error updating incident:", error);
    }
  };

  if (!metrics || !incidentMetrics || !vulnerabilityMetrics) {
    return <div className="loading">Loading security dashboard...</div>;
  }

  const filteredEvents = events.filter((event) => {
    const matchesRisk =
      riskFilter === "All" || event.risk_level === riskFilter;

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      event.username.toLowerCase().includes(search) ||
      event.event_type.toLowerCase().includes(search) ||
      event.location.toLowerCase().includes(search) ||
      event.ip_address.toLowerCase().includes(search) ||
      event.event_id.toString().includes(search);

    return matchesRisk && matchesSearch;
  });

  const riskData = [
    {
      name: "Critical",
      value: metrics.critical_events,
    },
    {
      name: "High",
      value: metrics.high_risk_events,
    },
  ];

  const incidentStatusData = [
    {
      name: "Open",
      value: incidentMetrics.open,
    },
    {
      name: "Investigating",
      value: incidentMetrics.investigating,
    },
    {
      name: "Resolved",
      value: incidentMetrics.resolved,
    },
  ];

  const vulnerabilitySeverityData = [
    {
      name: "Critical",
      value: vulnerabilityMetrics.critical,
    },
    {
      name: "High",
      value: vulnerabilityMetrics.high,
    },
    {
      name: "Medium",
      value: vulnerabilityMetrics.medium,
    },
  ];

  const vulnerabilityStatusData = [
    {
      name: "Open",
      value: vulnerabilityMetrics.open,
    },
    {
      name: "In Progress",
      value: vulnerabilityMetrics.in_progress,
    },
    {
      name: "Resolved",
      value: vulnerabilityMetrics.resolved,
    },
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);

    const element = document.getElementById(sectionId);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="dashboard">

      {/* HEADER */}
      <header className="main-header">
        <div>
          <h1>Financial Security Operations Platform</h1>

          <p>
            Cybersecurity monitoring, risk analysis, and vulnerability management
          </p>
        </div>

        <div className="status">
          <span></span>
          System Operational
        </div>
      </header>

      {/* NAVIGATION */}
      <nav className="dashboard-nav">

        <button
          className={activeSection === "overview" ? "active" : ""}
          onClick={() => scrollToSection("overview")}
        >
          Overview
        </button>

        <button
          className={activeSection === "alerts" ? "active" : ""}
          onClick={() => scrollToSection("alerts")}
        >
          Security Alerts
        </button>

        <button
          className={activeSection === "incidents" ? "active" : ""}
          onClick={() => scrollToSection("incidents")}
        >
          Incidents
        </button>

        <button
          className={activeSection === "vulnerabilities" ? "active" : ""}
          onClick={() => scrollToSection("vulnerabilities")}
        >
          Vulnerabilities
        </button>

        <button
          className={activeSection === "nist" ? "active" : ""}
          onClick={() => scrollToSection("nist")}
        >
          NIST CSF
        </button>

      </nav>

      {/* OVERVIEW */}
      <section id="overview">

        {/* SECURITY METRICS */}
        <section className="metrics">

          <div className="metric-card">
            <h3>Security Events</h3>
            <strong>{metrics.total_events}</strong>
            <p>Total monitored events</p>
          </div>

          <div className="metric-card">
            <h3>Critical Events</h3>
            <strong>{metrics.critical_events}</strong>
            <p>Require immediate review</p>
          </div>

          <div className="metric-card">
            <h3>High-Risk Events</h3>
            <strong>{metrics.high_risk_events}</strong>
            <p>Require investigation</p>
          </div>

          <div className="metric-card">
            <h3>Suspicious IPs</h3>
            <strong>{metrics.suspicious_ips}</strong>
            <p>IPs linked to high-risk events</p>
          </div>

        </section>

        {/* SECURITY CHARTS */}
        <section className="charts">

          <div className="chart-card">

            <h2>High-Risk Security Events</h2>

            <ResponsiveContainer width="100%" height={300}>

              <BarChart data={riskData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="value"
                  name="Security Events"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

          <div className="chart-card">

            <h2>Incident Status</h2>

            <ResponsiveContainer width="100%" height={300}>

              <BarChart data={incidentStatusData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="value"
                  name="Incidents"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </section>

      </section>

      {/* SECURITY ALERTS */}
      <section
        id="alerts"
        className="alerts"
      >

        <div className="alerts-header">

          <div>

            <h2>Security Alerts</h2>

            <p>
              Click an event to view detailed risk information
            </p>

          </div>

          <div className="filter-container">

            <label htmlFor="risk-filter">
              Risk Level:
            </label>

            <select
              id="risk-filter"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >

              <option value="All">All</option>

              <option value="Critical">Critical</option>

              <option value="High">High</option>

              <option value="Medium">Medium</option>

              <option value="Low">Low</option>

            </select>

          </div>

        </div>

        <div className="search-container">

          <input
            type="text"
            placeholder="Search username, event, location, IP address, or event ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

        </div>

        <p className="result-count">
          Showing {filteredEvents.length} security events
        </p>

        <table>

          <thead>

            <tr>
              <th>Event ID</th>
              <th>User</th>
              <th>Event</th>
              <th>Location</th>
              <th>IP Address</th>
              <th>Risk Score</th>
              <th>Risk Level</th>
            </tr>

          </thead>

          <tbody>

            {filteredEvents.map((event) => (

              <tr
                key={event.event_id}
                onClick={() => setSelectedEvent(event)}
                className="event-row"
              >

                <td>{event.event_id}</td>

                <td>{event.username}</td>

                <td>{event.event_type}</td>

                <td>{event.location}</td>

                <td>{event.ip_address}</td>

                <td>
                  <strong>{event.risk_score}</strong>
                </td>

                <td>

                  <span
                    className={`severity ${event.risk_level.toLowerCase()}`}
                  >
                    {event.risk_level}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </section>

      {/* EVENT DETAIL MODAL */}
      {selectedEvent && (

        <div className="event-overlay">

          <div className="event-modal">

            <div className="event-modal-header">

              <div>

                <h2>Security Event Details</h2>

                <p>
                  Event ID: {selectedEvent.event_id}
                </p>

              </div>

              <button
                className="close-button"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </button>

            </div>

            <div className="event-details">

              <div>
                <strong>User</strong>
                <p>{selectedEvent.username}</p>
              </div>

              <div>
                <strong>Event Type</strong>
                <p>{selectedEvent.event_type}</p>
              </div>

              <div>
                <strong>Location</strong>
                <p>{selectedEvent.location}</p>
              </div>

              <div>
                <strong>IP Address</strong>
                <p>{selectedEvent.ip_address}</p>
              </div>

              <div>
                <strong>Failed Attempts</strong>
                <p>{selectedEvent.failed_attempts}</p>
              </div>

              <div>
                <strong>Data Transferred</strong>
                <p>{selectedEvent.data_transferred_mb} MB</p>
              </div>

              <div>
                <strong>Privileged Account</strong>
                <p>
                  {selectedEvent.privileged_account ? "Yes" : "No"}
                </p>
              </div>

              <div>
                <strong>Risk Score</strong>
                <p>{selectedEvent.risk_score}/100</p>
              </div>

            </div>

            <div className="risk-summary">

              <h3>
                Risk Level:{" "}

                <span
                  className={`severity ${selectedEvent.risk_level.toLowerCase()}`}
                >
                  {selectedEvent.risk_level}
                </span>

              </h3>

              <h3>
                Why was this event flagged?
              </h3>

              {selectedEvent.risk_factors &&
              selectedEvent.risk_factors.length > 0 ? (

                <ul>

                  {selectedEvent.risk_factors.map(
                    (factor, index) => (
                      <li key={index}>
                        {factor}
                      </li>
                    )
                  )}

                </ul>

              ) : (

                <p>
                  No major risk factors detected.
                </p>

              )}

            </div>

          </div>

        </div>

      )}

      {/* INCIDENTS */}
      <section
        id="incidents"
        className="section-container"
      >

        <section className="metrics">

          <div className="metric-card">
            <h3>Open Incidents</h3>
            <strong>{incidentMetrics.open}</strong>
            <p>Incidents requiring action</p>
          </div>

          <div className="metric-card">
            <h3>Investigating</h3>
            <strong>{incidentMetrics.investigating}</strong>
            <p>Currently under investigation</p>
          </div>

          <div className="metric-card">
            <h3>Resolved</h3>
            <strong>{incidentMetrics.resolved}</strong>
            <p>Successfully resolved incidents</p>
          </div>

          <div className="metric-card">
            <h3>Total Incidents</h3>

            <strong>
              {incidentMetrics.open +
                incidentMetrics.investigating +
                incidentMetrics.resolved}
            </strong>

            <p>Total tracked incidents</p>
          </div>

        </section>

        <section className="alerts">

          <h2>Incident Management</h2>

          <p>
            Click an incident to review details and update its response status.
          </p>

          <table>

            <thead>

              <tr>
                <th>Incident ID</th>
                <th>Event ID</th>
                <th>Severity</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
              </tr>

            </thead>

            <tbody>

              {incidents.map((incident) => (

                <tr
                  key={incident.incident_id}
                  className="event-row"
                  onClick={() => setSelectedIncident(incident)}
                >

                  <td>{incident.incident_id}</td>

                  <td>{incident.event_id}</td>

                  <td>

                    <span
                      className={`severity ${incident.severity.toLowerCase()}`}
                    >
                      {incident.severity}
                    </span>

                  </td>

                  <td>{incident.description}</td>

                  <td>{incident.status}</td>

                  <td>{incident.created_at}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </section>

      </section>

      {/* INCIDENT DETAIL MODAL */}
      {selectedIncident && (

        <div className="event-overlay">

          <div className="event-modal">

            <div className="event-modal-header">

              <div>

                <h2>Incident Details</h2>

                <p>
                  Incident ID: {selectedIncident.incident_id}
                </p>

              </div>

              <button
                className="close-button"
                onClick={() => setSelectedIncident(null)}
              >
                ×
              </button>

            </div>

            <div className="event-details">

              <div>
                <strong>Incident ID</strong>
                <p>{selectedIncident.incident_id}</p>
              </div>

              <div>
                <strong>Related Event</strong>
                <p>{selectedIncident.event_id}</p>
              </div>

              <div>
                <strong>Severity</strong>

                <p>

                  <span
                    className={`severity ${selectedIncident.severity.toLowerCase()}`}
                  >
                    {selectedIncident.severity}
                  </span>

                </p>

              </div>

              <div>
                <strong>Current Status</strong>
                <p>{selectedIncident.status}</p>
              </div>

              <div>
                <strong>Created</strong>
                <p>{selectedIncident.created_at}</p>
              </div>

            </div>

            <div className="risk-summary">

              <h3>Incident Description</h3>

              <p>
                {selectedIncident.description}
              </p>

              <h3>
                Update Incident Status
              </h3>

              <div className="incident-actions">

                <button
                  onClick={() =>
                    updateIncidentStatus(
                      selectedIncident.incident_id,
                      "Open"
                    )
                  }
                >
                  Open
                </button>

                <button
                  onClick={() =>
                    updateIncidentStatus(
                      selectedIncident.incident_id,
                      "Investigating"
                    )
                  }
                >
                  Investigating
                </button>

                <button
                  onClick={() =>
                    updateIncidentStatus(
                      selectedIncident.incident_id,
                      "Resolved"
                    )
                  }
                >
                  Resolved
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* VULNERABILITIES */}
      <section
        id="vulnerabilities"
        className="section-container"
      >

        <section className="metrics">

          <div className="metric-card">
            <h3>Critical Vulnerabilities</h3>
            <strong>{vulnerabilityMetrics.critical}</strong>
            <p>Highest priority vulnerabilities</p>
          </div>

          <div className="metric-card">
            <h3>High Vulnerabilities</h3>
            <strong>{vulnerabilityMetrics.high}</strong>
            <p>Require remediation</p>
          </div>

          <div className="metric-card">
            <h3>Open Vulnerabilities</h3>
            <strong>{vulnerabilityMetrics.open}</strong>
            <p>Awaiting remediation</p>
          </div>

          <div className="metric-card">
            <h3>Resolved Vulnerabilities</h3>
            <strong>{vulnerabilityMetrics.resolved}</strong>
            <p>Successfully remediated</p>
          </div>

        </section>

        <section className="charts">

          <div className="chart-card">

            <h2>Vulnerability Severity</h2>

            <ResponsiveContainer width="100%" height={300}>

              <BarChart data={vulnerabilitySeverityData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="value"
                  name="Vulnerabilities"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

          <div className="chart-card">

            <h2>Vulnerability Status</h2>

            <ResponsiveContainer width="100%" height={300}>

              <BarChart data={vulnerabilityStatusData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="value"
                  name="Vulnerabilities"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </section>

        <section className="alerts">

          <h2>Vulnerability Management</h2>

          <p>
            Track vulnerabilities, severity, remediation status, and responsible
            teams.
          </p>

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>System</th>
                <th>Vulnerability</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Remediation Owner</th>
              </tr>

            </thead>

            <tbody>

              {vulnerabilities.map((vulnerability) => (

                <tr key={vulnerability.vulnerability_id}>

                  <td>{vulnerability.vulnerability_id}</td>

                  <td>{vulnerability.system_name}</td>

                  <td>{vulnerability.vulnerability_name}</td>

                  <td>

                    <span
                      className={`severity ${vulnerability.severity.toLowerCase()}`}
                    >
                      {vulnerability.severity}
                    </span>

                  </td>

                  <td>{vulnerability.status}</td>

                  <td>{vulnerability.remediation_owner}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </section>

      </section>

      {/* NIST */}
      <section
        id="nist"
        className="alerts"
      >

        <h2>NIST Cybersecurity Framework Mapping</h2>

        <p>
          Security monitoring activities mapped to the NIST Cybersecurity
          Framework.
        </p>

        <table>

          <thead>

            <tr>
              <th>Function</th>
              <th>Category</th>
              <th>Description</th>
              <th>Project Implementation</th>
            </tr>

          </thead>

          <tbody>

            {nistControls.map((control) => (

              <tr key={control.control_id}>

                <td>
                  <strong>{control.function}</strong>
                </td>

                <td>{control.category}</td>

                <td>{control.description}</td>

                <td>{control.project_implementation}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </section>

    </div>
  );
}

export default App;
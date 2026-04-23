import { useEffect, useState } from "react";
import api from "../api/axiosClient.js";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  return new Date(dateValue).toLocaleDateString();
}

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "—";
  }

  return new Date(dateValue).toLocaleString();
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/dashboard/admin");
      setDashboard(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingState message="Loading admin dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboard} />;
  }

  if (!dashboard) {
    return (
      <EmptyState
        title="Dashboard unavailable"
        message="No dashboard data was returned by the server."
      />
    );
  }

  const { counts, recent_updates, fields } = dashboard;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Monitor all fields, update activity, and season-wide progress.</p>
        </div>
        <button className="button secondary" onClick={loadDashboard}>
          Refresh Dashboard
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Fields</span>
          <strong className="stat-value">{counts?.total_fields ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active</span>
          <strong className="stat-value">{counts?.active ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">At Risk</span>
          <strong className="stat-value">{counts?.at_risk ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Completed</span>
          <strong className="stat-value">{counts?.completed ?? 0}</strong>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h3>Recent Updates Feed</h3>
          </div>

          {!recent_updates || recent_updates.length === 0 ? (
            <EmptyState
              title="No updates available"
              message="No field updates have been recorded yet."
            />
          ) : (
            <div className="feed-list">
              {recent_updates.map((update) => (
                <div key={update.id} className="feed-item">
                  <div className="feed-item-top">
                    <strong>{update.field_name}</strong>
                    <StatusBadge label={update.stage} />
                  </div>
                  <p>{update.notes}</p>
                  <div className="meta-row">
                    <span>Agent: {update.agent_name}</span>
                    <span>{formatDateTime(update.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Field Overview</h3>
          </div>

          {!fields || fields.length === 0 ? (
            <EmptyState
              title="No fields found"
              message="Create fields to start monitoring the season."
            />
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Crop</th>
                    <th>Planting Date</th>
                    <th>Stage</th>
                    <th>Status</th>
                    <th>Assigned Agent</th>
                    <th>Last Update</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field) => (
                    <tr key={field.id}>
                      <td>{field.name}</td>
                      <td>{field.crop_type}</td>
                      <td>{formatDate(field.planting_date)}</td>
                      <td>
                        <StatusBadge label={field.current_stage} />
                      </td>
                      <td>
                        <StatusBadge label={field.status} />
                      </td>
                      <td>{field.assigned_agent_name || "—"}</td>
                      <td>{formatDateTime(field.last_update_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

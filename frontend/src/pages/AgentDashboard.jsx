import { useEffect, useMemo, useState } from "react";
import api from "../api/axiosClient.js";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const STAGES = ["Planted", "Growing", "Ready", "Harvested"];

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

export default function AgentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [fieldUpdates, setFieldUpdates] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState("");
  const [updateForm, setUpdateForm] = useState({
    stage: "Planted",
    notes: ""
  });
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/dashboard/agent");
      const data = response.data;
      setDashboard(data);

      if (data.fields?.length > 0) {
        const defaultFieldId = String(data.fields[0].id);
        setSelectedFieldId((previous) => previous || defaultFieldId);

        const defaultField = data.fields[0];
        setUpdateForm((previous) => ({
          ...previous,
          stage: defaultField.current_stage || "Planted"
        }));
      } else {
        setSelectedFieldId("");
        setFieldUpdates([]);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load agent dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function loadFieldHistory(fieldId) {
    if (!fieldId) {
      setFieldUpdates([]);
      return;
    }

    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await api.get(`/fields/${fieldId}/updates`);
      setFieldUpdates(response.data);
    } catch (requestError) {
      setHistoryError(requestError.response?.data?.message || "Failed to load update history.");
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (selectedFieldId) {
      loadFieldHistory(selectedFieldId);
    }
  }, [selectedFieldId]);

  const selectedField = useMemo(() => {
    if (!dashboard?.fields?.length || !selectedFieldId) {
      return null;
    }

    return dashboard.fields.find((field) => String(field.id) === String(selectedFieldId)) || null;
  }, [dashboard, selectedFieldId]);

  function handleFieldChange(event) {
    const nextFieldId = event.target.value;
    setSelectedFieldId(nextFieldId);

    const nextField =
      dashboard?.fields?.find((field) => String(field.id) === String(nextFieldId)) || null;

    setUpdateForm((previous) => ({
      ...previous,
      stage: nextField?.current_stage || "Planted"
    }));
    setSubmitMessage("");
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setUpdateForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFieldId) {
      return;
    }

    setSubmitting(true);
    setSubmitMessage("");
    setHistoryError("");

    try {
      await api.post(`/fields/${selectedFieldId}/updates`, {
        stage: updateForm.stage,
        notes: updateForm.notes
      });

      setSubmitMessage("Field update submitted successfully.");
      setUpdateForm((previous) => ({
        ...previous,
        notes: ""
      }));

      await loadDashboard();
      await loadFieldHistory(selectedFieldId);
    } catch (requestError) {
      setHistoryError(requestError.response?.data?.message || "Failed to submit field update.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState message="Loading agent dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboard} />;
  }

  if (!dashboard) {
    return (
      <EmptyState
        title="Dashboard unavailable"
        message="Agent dashboard data was not returned by the server."
      />
    );
  }

  const { summary, recent_updates, fields } = dashboard;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Agent Dashboard</h2>
          <p>Track your assigned fields, add updates, and monitor progress.</p>
        </div>
        <button className="button secondary" onClick={loadDashboard}>
          Refresh Dashboard
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Assigned Fields</span>
          <strong className="stat-value">{summary?.assigned_fields ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active</span>
          <strong className="stat-value">{summary?.active ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">At Risk</span>
          <strong className="stat-value">{summary?.at_risk ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Completed</span>
          <strong className="stat-value">{summary?.completed ?? 0}</strong>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h3>Assigned Fields</h3>
          </div>

          {!fields || fields.length === 0 ? (
            <EmptyState
              title="No assigned fields"
              message="You do not have any fields assigned yet."
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
                      <td>{formatDateTime(field.last_update_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Submit Field Update</h3>
          </div>

          {!fields || fields.length === 0 ? (
            <EmptyState
              title="No field selected"
              message="Updates can be submitted once a field is assigned to you."
            />
          ) : (
            <>
              {submitMessage ? <div className="alert success">{submitMessage}</div> : null}
              {historyError ? <div className="alert error">{historyError}</div> : null}

              <form className="form-grid" onSubmit={handleSubmit}>
                <label className="form-field">
                  <span>Assigned Field</span>
                  <select value={selectedFieldId} onChange={handleFieldChange} required>
                    {fields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.name} — {field.crop_type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Stage</span>
                  <select
                    name="stage"
                    value={updateForm.stage}
                    onChange={handleInputChange}
                    required
                  >
                    {STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field full-span">
                  <span>Notes</span>
                  <textarea
                    name="notes"
                    value={updateForm.notes}
                    onChange={handleInputChange}
                    placeholder="Add progress notes, issues observed, or harvest readiness details."
                    rows="5"
                    required
                  />
                </label>

                <button className="button primary" type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Add Update"}
                </button>
              </form>

              {selectedField ? (
                <div className="selected-field-card">
                  <h4>Selected Field Summary</h4>
                  <div className="selected-field-grid">
                    <div>
                      <span className="mini-label">Field</span>
                      <strong>{selectedField.name}</strong>
                    </div>
                    <div>
                      <span className="mini-label">Crop</span>
                      <strong>{selectedField.crop_type}</strong>
                    </div>
                    <div>
                      <span className="mini-label">Current Stage</span>
                      <strong>{selectedField.current_stage}</strong>
                    </div>
                    <div>
                      <span className="mini-label">Status</span>
                      <strong>{selectedField.status}</strong>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h3>Selected Field Update History</h3>
          </div>

          {!selectedFieldId ? (
            <EmptyState
              title="No field selected"
              message="Select a field to view update history."
            />
          ) : historyLoading ? (
            <LoadingState message="Loading field update history..." />
          ) : historyError ? (
            <ErrorState message={historyError} onRetry={() => loadFieldHistory(selectedFieldId)} />
          ) : !fieldUpdates || fieldUpdates.length === 0 ? (
            <EmptyState
              title="No update history"
              message="This field does not have any updates yet."
            />
          ) : (
            <div className="feed-list">
              {fieldUpdates.map((update) => (
                <div key={update.id} className="feed-item">
                  <div className="feed-item-top">
                    <strong>{selectedField?.name || `Field #${update.field_id}`}</strong>
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
            <h3>Recent Updates Across Your Fields</h3>
          </div>

          {!recent_updates || recent_updates.length === 0 ? (
            <EmptyState
              title="No recent updates"
              message="Recent updates for your fields will appear here."
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
      </div>
    </div>
  );
}

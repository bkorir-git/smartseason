import { useEffect, useMemo, useState } from "react";
import api from "../api/axiosClient.js";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "—";
  }

  return new Date(dateValue).toLocaleString();
}

export default function UpdatesPage() {
  const { user } = useAuth();

  const [fields, setFields] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatesLoading, setUpdatesLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatesError, setUpdatesError] = useState("");

  async function loadFieldsForAgent() {
    try {
      const fieldsResponse = await api.get("/fields");
      const loadedFields = fieldsResponse.data;
      setFields(loadedFields);

      if (loadedFields.length > 0) {
        const firstFieldId = String(loadedFields[0].id);
        setSelectedFieldId((previous) => previous || firstFieldId);
        return firstFieldId;
      }

      setSelectedFieldId("");
      setUpdates([]);
      return "";
    } catch (requestError) {
      throw new Error(requestError.response?.data?.message || "Failed to load assigned fields.");
    }
  }

  async function loadAdminFeed() {
    setUpdatesLoading(true);
    setUpdatesError("");

    try {
      const response = await api.get("/updates/feed");
      setUpdates(response.data);
    } catch (requestError) {
      setUpdatesError(requestError.response?.data?.message || "Failed to load updates feed.");
    } finally {
      setUpdatesLoading(false);
    }
  }

  async function loadFieldUpdates(fieldId) {
    if (!fieldId) {
      setUpdates([]);
      return;
    }

    setUpdatesLoading(true);
    setUpdatesError("");

    try {
      const response = await api.get(`/fields/${fieldId}/updates`);
      setUpdates(response.data);
    } catch (requestError) {
      setUpdatesError(requestError.response?.data?.message || "Failed to load field updates.");
    } finally {
      setUpdatesLoading(false);
    }
  }

  async function initializePage() {
    setLoading(true);
    setError("");

    try {
      if (user?.role === "admin") {
        await loadAdminFeed();
      } else {
        const firstFieldId = await loadFieldsForAgent();
        if (firstFieldId) {
          await loadFieldUpdates(firstFieldId);
        }
      }
    } catch (pageError) {
      setError(pageError.message || "Failed to initialize updates page.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role) {
      initializePage();
    }
  }, [user]);

  async function handleRefresh() {
    if (user?.role === "admin") {
      await loadAdminFeed();
      return;
    }

    await loadFieldUpdates(selectedFieldId);
  }

  async function handleFieldChange(event) {
    const nextFieldId = event.target.value;
    setSelectedFieldId(nextFieldId);
    await loadFieldUpdates(nextFieldId);
  }

  const selectedField = useMemo(() => {
    if (!selectedFieldId || !fields.length) {
      return null;
    }

    return fields.find((field) => String(field.id) === String(selectedFieldId)) || null;
  }, [selectedFieldId, fields]);

  if (loading) {
    return <LoadingState message="Loading updates page..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={initializePage} />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Updates</h2>
          <p>
            {user?.role === "admin"
              ? "View the global updates feed across all fields."
              : "View update history for your assigned fields."}
          </p>
        </div>
        <button className="button secondary" onClick={handleRefresh}>
          Refresh Updates
        </button>
      </div>

      {user?.role === "agent" ? (
        <section className="panel">
          <div className="panel-header">
            <h3>Field Update History</h3>
          </div>

          {!fields || fields.length === 0 ? (
            <EmptyState
              title="No assigned fields"
              message="No update history is available because you do not have assigned fields."
            />
          ) : (
            <div className="form-inline">
              <label className="form-field narrow">
                <span>Select Field</span>
                <select value={selectedFieldId} onChange={handleFieldChange}>
                  {fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name} — {field.crop_type}
                    </option>
                  ))}
                </select>
              </label>

              {selectedField ? (
                <div className="inline-summary">
                  <span>Current Stage: {selectedField.current_stage}</span>
                  <span>Status: {selectedField.status}</span>
                </div>
              ) : null}
            </div>
          )}
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-header">
          <h3>{user?.role === "admin" ? "Global Updates Feed" : "Update History"}</h3>
        </div>

        {updatesLoading ? (
          <LoadingState message="Loading updates..." />
        ) : updatesError ? (
          <ErrorState message={updatesError} onRetry={handleRefresh} />
        ) : !updates || updates.length === 0 ? (
          <EmptyState
            title="No updates found"
            message={
              user?.role === "admin"
                ? "No updates have been posted across the system yet."
                : "The selected field does not have any updates yet."
            }
          />
        ) : (
          <div className="feed-list">
            {updates.map((update) => (
              <div key={update.id} className="feed-item">
                <div className="feed-item-top">
                  <strong>
                    {user?.role === "admin"
                      ? update.field_name
                      : selectedField?.name || `Field #${update.field_id}`}
                  </strong>
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
  );
}

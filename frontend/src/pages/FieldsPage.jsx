import { useEffect, useState } from "react";
import api from "../api/axiosClient.js";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";

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

export default function FieldsPage() {
  const { user } = useAuth();

  const [fields, setFields] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [fieldForm, setFieldForm] = useState({
    name: "",
    crop_type: "",
    planting_date: "",
    current_stage: "Planted",
    assigned_agent_id: ""
  });

  async function loadFields() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/fields");
      setFields(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load fields.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAgents() {
    if (user?.role !== "admin") {
      return;
    }

    setAgentsLoading(true);

    try {
      const response = await api.get("/users/agents");
      setAgents(response.data);

      if (response.data.length > 0) {
        setFieldForm((previous) => ({
          ...previous,
          assigned_agent_id: previous.assigned_agent_id || String(response.data[0].id)
        }));
      }
    } catch (requestError) {
      setSubmitError(requestError.response?.data?.message || "Failed to load agents.");
    } finally {
      setAgentsLoading(false);
    }
  }

  useEffect(() => {
    loadFields();
  }, []);

  useEffect(() => {
    loadAgents();
  }, [user]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFieldForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function handleCreateField(event) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSubmitMessage("");

    try {
      await api.post("/fields", {
        ...fieldForm,
        assigned_agent_id: Number(fieldForm.assigned_agent_id)
      });

      setSubmitMessage("Field created successfully.");
      setFieldForm({
        name: "",
        crop_type: "",
        planting_date: "",
        current_stage: "Planted",
        assigned_agent_id: agents[0] ? String(agents[0].id) : ""
      });

      await loadFields();
    } catch (requestError) {
      setSubmitError(requestError.response?.data?.message || "Failed to create field.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState message="Loading fields..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadFields} />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>{user?.role === "admin" ? "All Fields" : "Assigned Fields"}</h2>
          <p>
            {user?.role === "admin"
              ? "Create new fields, assign field agents, and monitor season status."
              : "Review the fields assigned to you and monitor their current status."}
          </p>
        </div>
        <button className="button secondary" onClick={loadFields}>
          Refresh Fields
        </button>
      </div>

      {user?.role === "admin" ? (
        <section className="panel">
          <div className="panel-header">
            <h3>Create New Field</h3>
          </div>

          {submitMessage ? <div className="alert success">{submitMessage}</div> : null}
          {submitError ? <div className="alert error">{submitError}</div> : null}

          {agentsLoading ? (
            <LoadingState message="Loading agents for assignment..." />
          ) : agents.length === 0 ? (
            <EmptyState
              title="No agents available"
              message="At least one field agent must exist before creating a field."
            />
          ) : (
            <form className="form-grid" onSubmit={handleCreateField}>
              <label className="form-field">
                <span>Field Name</span>
                <input
                  type="text"
                  name="name"
                  value={fieldForm.name}
                  onChange={handleChange}
                  placeholder="e.g. West Orchard"
                  required
                />
              </label>

              <label className="form-field">
                <span>Crop Type</span>
                <input
                  type="text"
                  name="crop_type"
                  value={fieldForm.crop_type}
                  onChange={handleChange}
                  placeholder="e.g. Maize"
                  required
                />
              </label>

              <label className="form-field">
                <span>Planting Date</span>
                <input
                  type="date"
                  name="planting_date"
                  value={fieldForm.planting_date}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="form-field">
                <span>Current Stage</span>
                <select
                  name="current_stage"
                  value={fieldForm.current_stage}
                  onChange={handleChange}
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
                <span>Assign Agent</span>
                <select
                  name="assigned_agent_id"
                  value={fieldForm.assigned_agent_id}
                  onChange={handleChange}
                  required
                >
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} — {agent.email}
                    </option>
                  ))}
                </select>
              </label>

              <button className="button primary" type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Field"}
              </button>
            </form>
          )}
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-header">
          <h3>Field List</h3>
        </div>

        {!fields || fields.length === 0 ? (
          <EmptyState
            title="No fields available"
            message={
              user?.role === "admin"
                ? "No fields have been created yet."
                : "You do not have any fields assigned at the moment."
            }
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
                  <th>Created By</th>
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
                    <td>{field.created_by_name || "—"}</td>
                    <td>{formatDateTime(field.last_update_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
  email: "",
  password: ""
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
    } else if (user?.role === "agent") {
      navigate("/agent", { replace: true });
    }
  }, [user, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const loggedInUser = await login(form);

      if (loggedInUser.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/agent", { replace: true });
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>SmartSeason</h1>
          <p>Sign in to manage seasonal field monitoring.</p>
        </div>

        {error ? <div className="alert error">{error}</div> : null}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </label>

          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </label>

          <button className="button primary full-width" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="demo-credentials">
          <h3>Seeded Demo Credentials</h3>
          <div className="credential-list">
            <div className="credential-item">
              <strong>Admin</strong>
              <span>admin@smartseason.com / admin123</span>
            </div>
            <div className="credential-item">
              <strong>Agent</strong>
              <span>alice@smartseason.com / agent123</span>
            </div>
            <div className="credential-item">
              <strong>Agent</strong>
              <span>bob@smartseason.com / agent123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useState } from "react";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      {/* Mobile menu button */}
      <button className="menu-btn" onClick={() => setOpen(!open)}>
        ☰
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand-block">
          <h1>SmartSeason</h1>
          <p>Field Monitoring System</p>
        </div>

        <div className="user-card">
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
          <span className="role-chip">{user?.role}</span>
        </div>

        <nav className="nav-links">
          <NavLink
            to={user?.role === "admin" ? "/admin" : "/agent"}
            className="nav-link"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/fields"
            className="nav-link"
            onClick={() => setOpen(false)}
          >
            Fields
          </NavLink>

          <NavLink
            to="/updates"
            className="nav-link"
            onClick={() => setOpen(false)}
          >
            Updates
          </NavLink>
        </nav>

        <button className="button danger full-width" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="content-area" onClick={() => setOpen(false)}>
        <Outlet />
      </main>
    </div>
  );
}
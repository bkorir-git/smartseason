import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
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
          <NavLink to={user?.role === "admin" ? "/admin" : "/agent"} className="nav-link">
            Dashboard
          </NavLink>
          <NavLink to="/fields" className="nav-link">
            Fields
          </NavLink>
          <NavLink to="/updates" className="nav-link">
            Updates
          </NavLink>
        </nav>

        <button className="button danger full-width" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
}

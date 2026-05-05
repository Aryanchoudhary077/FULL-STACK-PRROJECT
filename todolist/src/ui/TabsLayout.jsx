import { NavLink, Outlet } from "react-router-dom";
import { getUsername } from "../lib/auth";
import "../styles/Tabs.css";

function tabClass({ isActive }) {
  return `tabLink${isActive ? " tabLinkActive" : ""}`;
}

export default function TabsLayout() {
  const username = getUsername();

  return (
    <div className="tabsShell">
      <header className="tabsTopbar">
        <div className="tabsBrand">
          <div className="tabsMark" aria-hidden="true" />
          <div>
            <p className="tabsTitle">MERN To-Do</p>
            <p className="muted">@{username}</p>
          </div>
        </div>

        <nav className="tabsNav" aria-label="Primary tabs">
          <NavLink end to="/" className={tabClass}>
            Dashboard
          </NavLink>
          <NavLink to="/todos" className={tabClass}>
            Todos
          </NavLink>
          <NavLink to="/profile" className={tabClass}>
            Profile
          </NavLink>
          <NavLink to="/about" className={tabClass}>
            About
          </NavLink>
        </nav>
      </header>

      <Outlet />
    </div>
  );
}


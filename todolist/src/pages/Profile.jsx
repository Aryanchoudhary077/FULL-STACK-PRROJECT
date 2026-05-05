import { useNavigate } from "react-router-dom";
import { clearSession, getUsername } from "../lib/auth";
import "../styles/Tabs.css";

export default function Profile() {
  const nav = useNavigate();
  const username = getUsername();

  return (
    <div className="page">
      <h2 className="pageTitle">Profile</h2>
      <div className="panel">
        <p className="muted">
          Logged in as <span className="pill">@{username || "unknown"}</span>
        </p>
        <button
          className="dangerBtn"
          type="button"
          onClick={() => {
            clearSession();
            nav("/login", { replace: true });
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { setSession } from "../lib/auth";
import "../styles/Auth.css";

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password || busy) return;

    setBusy(true);
    setError("");
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: { username, password },
      });
      setSession({ token: data.token, username: data.user.username });
      nav("/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="authShell">
      <div className="authCard">
        <div className="authHeader">
          <div className="authMark" aria-hidden="true" />
          <div>
            <h1 className="authTitle">Welcome back</h1>
            <p className="authSub">Login to manage your personal todos.</p>
          </div>
        </div>

        {error ? (
          <div className="authAlert" role="alert">
            {error}
          </div>
        ) : null}

        <form className="authForm" onSubmit={onSubmit}>
          <label className="authLabel">
            Username
            <input
              className="authInput"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="abhinav"
              autoComplete="username"
              disabled={busy}
            />
          </label>

          <label className="authLabel">
            Password
            <input
              className="authInput"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              autoComplete="current-password"
              disabled={busy}
            />
          </label>

          

          <button className="authPrimary" type="submit" disabled={busy}>
            {busy ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className="authFooter">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}


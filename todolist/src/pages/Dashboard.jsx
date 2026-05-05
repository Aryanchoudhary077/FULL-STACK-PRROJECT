import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import "../styles/Tabs.css";

export default function Dashboard() {
  const categories = {
    Sports: "⚽",
    Computer: "💻",
    Study: "📚",
    Workout: "💪",
    college: "💪",
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [todos, setTodos] = useState([]);
  const [userOnline, setUserOnline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([apiFetch("/me"), apiFetch("/todos")])
      .then((results) => {
        if (cancelled) return;

        const meResult = results[0];
        const todosRes = results[1];

        setUserOnline(meResult.status === "fulfilled");

        if (todosRes.status === "fulfilled") {
          // ✅ REMOVE General + empty categories
          const filtered = todosRes.value.filter(
            (todo) => todo.category && todo.category !== "General"
          );

          setTodos(filtered);
        } else {
          setError(todosRes.reason?.message || "Failed to load todos");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const total = todos.length;

    const newest = todos[0]?.createdAt
      ? new Date(todos[0].createdAt)
      : null;

    const byCategory = todos.reduce((acc, todo) => {
      // ✅ SKIP General completely
      if (!todo.category || todo.category === "General") return acc;

      acc[todo.category] = (acc[todo.category] || 0) + 1;
      return acc;
    }, {});

    return { total, newest, byCategory };
  }, [todos]);

  return (
    <div className="page">
      <h2 className="pageTitle">Dashboard</h2>

      {error ? (
        <div className="panel dangerPanel" role="alert">
          {error}
        </div>
      ) : null}

      <div className="grid">
        <div className="stat">
          <div className="statLabel">User</div>
          <div className="statValue">
            {loading ? "…" : userOnline ? "Online" : "Offline"}
          </div>
        </div>

        <div className="stat">
          <div className="statLabel">Total todos</div>
          <div className="statValue">
            {loading ? "…" : stats.total}
          </div>
        </div>

        <div className="stat">
          <div className="statLabel">Newest</div>
          <div className="statValue">
            {loading
              ? "…"
              : stats.newest
              ? stats.newest.toLocaleString()
              : "—"}
          </div>
        </div>
      </div>

      <div className="panel dashboardPanel">
        <div className="dashboardHeader">
          <h3 className="panelTitle">Tasks Overview (View Only)</h3>
          <p className="muted">
            Read-only list. Edit tasks from the Todos tab.
          </p>
        </div>

        {loading ? (
          <div className="dashboardSkeleton">
            <div className="dashboardSkeletonRow" />
            <div className="dashboardSkeletonRow" />
            <div className="dashboardSkeletonRow" />
          </div>
        ) : todos.length === 0 ? (
          <div className="dashboardEmpty">
            No tasks yet. Add tasks in Todos tab.
          </div>
        ) : (
          <>
            {/* ✅ CATEGORY STATS (NO GENERAL) */}
            <div className="categoryStats">
              {Object.keys(categories).map((cat) => (
                <div className="categoryStat" key={cat}>
                  <span className="categoryStatName">
                    {categories[cat]} {cat}
                  </span>
                  <span className="categoryStatCount">
                    {stats.byCategory[cat] || 0}
                  </span>
                </div>
              ))}
            </div>

            {/* ✅ TASK LIST (NO GENERAL) */}
            <ul className="dashboardList" aria-label="All tasks">
              {todos.map((todo) => (
                <li className="dashboardItem" key={todo._id}>
                  <div className="dashboardItemMain">
                    <p className="dashboardTask">{todo.task}</p>

                    <span
                      className={`taskCategory taskCategory--${todo.category.toLowerCase()}`}
                    >
                      {categories[todo.category]} {todo.category}
                    </span>
                  </div>

                  <div className="dashboardMeta">
                    {todo.createdAt
                      ? new Date(todo.createdAt).toLocaleString()
                      : "—"}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
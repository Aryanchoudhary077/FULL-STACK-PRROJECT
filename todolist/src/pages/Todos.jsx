import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import "../App.css";
import "../styles/Tabs.css";

export default function Todos() {
  const categories = [
    { name: "Sports", icon: "⚽" },
    { name: "Computer", icon: "💻" },
    { name: "Study", icon: "📚" },
    { name: "Workout", icon: "💪" },
    { name: "college", icon: "💪" },
  ];
  const [task, setTask] = useState("");
  const [category, setCategory] = useState(categories[0].name);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editTask, setEditTask] = useState("");
  const [editCategory, setEditCategory] = useState(categories[0].name);
  const remaining = todos.length;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    apiFetch("/todos")
      .then((data) => {
        if (!cancelled) setTodos(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Failed to load todos");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const header = useMemo(() => {
    if (loading) return "Loading…";
    return `${remaining} item${remaining === 1 ? "" : "s"}`;
  }, [loading, remaining]);

  const addTask = async () => {
    if (!task.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const data = await apiFetch("/todos", { method: "POST", body: { task, category } });
      setTodos(data);
      setTask("");
      setCategory(categories[0].name);
    } catch (e) {
      setError(e.message || "Failed to add task");
    } finally {
      setBusy(false);
    }
  };

  const deleteTask = async (id) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const data = await apiFetch(`/todos/${id}`, { method: "DELETE" });
      setTodos(data);
    } catch (e) {
      setError(e.message || "Failed to delete task");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo._id);
    setEditTask(todo.task);
    setEditCategory(todo.category || categories[0].name);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditTask("");
    setEditCategory(categories[0].name);
  };

  const saveEdit = async () => {
    if (!editingId || !editTask.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const data = await apiFetch(`/todos/${editingId}`, {
        method: "PATCH",
        body: { task: editTask, category: editCategory },
      });
      setTodos(data);
      cancelEdit();
    } catch (e) {
      setError(e.message || "Failed to update task");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <h2 className="pageTitle">Todos</h2>
      <p className="muted">{header}</p>

      <main className="card" aria-busy={busy ? "true" : "false"}>
        {error ? (
          <div className="alert" role="alert">
            <span className="alertDot" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="composer">
          <label className="srOnly" htmlFor="taskInput">
            New task
          </label>
          <input
            id="taskInput"
            className="input"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Add a task…"
            disabled={busy}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask();
            }}
          />
          <button className="primaryBtn" onClick={addTask} disabled={busy || !task.trim()}>
            {busy ? "Working…" : "Add"}
          </button>
        </div>
        <div className="categoryChooser" role="radiogroup" aria-label="Activity category">
          {categories.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`categoryChip${category === item.name ? " categoryChipActive" : ""}`}
              onClick={() => setCategory(item.name)}
              disabled={busy}
              role="radio"
              aria-checked={category === item.name}
            >
              <span className="categoryIcon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="skeletonList" aria-label="Loading todos">
            <div className="skeletonRow" />
            <div className="skeletonRow" />
            <div className="skeletonRow" />
          </div>
        ) : todos.length === 0 ? (
          <div className="empty">
            <p className="emptyTitle">No tasks yet</p>
            <p className="emptyHint">Add your first task above.</p>
          </div>
        ) : (
          <ul className="list" aria-label="Todo list">
            {todos.map((t) => (
              <li className="row" key={t._id}>
                <div className="taskWrap">
                  {editingId === t._id ? (
                    <>
                      <input
                        className="input editInput"
                        value={editTask}
                        onChange={(e) => setEditTask(e.target.value)}
                        disabled={busy}
                      />
                      <div className="categoryChooser">
                        {categories.map((item) => (
                          <button
                            key={`edit-${t._id}-${item.name}`}
                            type="button"
                            className={`categoryChip${editCategory === item.name ? " categoryChipActive" : ""}`}
                            onClick={() => setEditCategory(item.name)}
                            disabled={busy}
                          >
                            <span className="categoryIcon" aria-hidden="true">
                              {item.icon}
                            </span>
                            <span>{item.name}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="task">{t.task}</span>
                      <span
                        className={`taskCategory taskCategory--${(t.category || "general").toLowerCase()}`}
                      >
                        {categories.find((c) => c.name === t.category)?.icon || "🏷️"}{" "}
                        {t.category || "General"}
                      </span>
                    </>
                  )}
                </div>
                <div className="rowActions">
                  {editingId === t._id ? (
                    <>
                      <button
                        className="smallBtn smallBtnSave"
                        type="button"
                        onClick={saveEdit}
                        disabled={busy || !editTask.trim()}
                      >
                        Save
                      </button>
                      <button
                        className="smallBtn"
                        type="button"
                        onClick={cancelEdit}
                        disabled={busy}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="smallBtn"
                        type="button"
                        onClick={() => startEdit(t)}
                        disabled={busy}
                      >
                        Edit
                      </button>
                      <button
                        className="iconBtn"
                        type="button"
                        onClick={() => deleteTask(t._id)}
                        disabled={busy}
                        aria-label={`Delete ${t.task}`}
                        title="Delete"
                      >
                        <span aria-hidden="true">✕</span>
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}


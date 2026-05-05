import "../styles/Tabs.css";

export default function About() {
  return (
    <div className="page">
      <h2 className="pageTitle">About</h2>
      <div className="panel">
        <p className="muted">
          This is a MERN To-Do app built with React (Vite), Node.js + Express, and MongoDB
          (via Mongoose). It includes authentication using JWT and stores todos per user.
        </p>
        <ul className="bullets">
          <li>Frontend: React </li>
          <li>Backend: Node.js + Express</li>
          <li>Database: MongoDB</li>
          <li>Auth: Password</li>
        </ul>
      </div>
    </div>
  );
}


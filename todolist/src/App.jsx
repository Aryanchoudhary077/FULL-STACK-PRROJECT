import { Navigate, Route, Routes } from "react-router-dom";
import { isAuthed } from "./lib/auth";
import TabsLayout from "./ui/TabsLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Todos from "./pages/Todos";
import Profile from "./pages/Profile";
import About from "./pages/About";

function Protected({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <Protected>
            <TabsLayout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="todos" element={<Todos />} />
        <Route path="profile" element={<Profile />} />
        <Route path="about" element={<About />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

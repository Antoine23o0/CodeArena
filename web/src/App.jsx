import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ContestList from "./pages/ContestList";
import Contest from "./pages/Contest";
import Submit from "./pages/Submit";
import Scoreboard from "./pages/Scoreboard";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<ContestList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/contests"
          element={
            <PrivateRoute>
              <ContestList />
            </PrivateRoute>
          }
        />
        <Route
          path="/contest/:id"
          element={
            <PrivateRoute>
              <Contest />
            </PrivateRoute>
          }
        />
        <Route
          path="/submit"
          element={
            <PrivateRoute>
              <Submit />
            </PrivateRoute>
          }
        />
        <Route
          path="/scoreboard"
          element={
            <PrivateRoute>
              <Scoreboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ContestList from "./pages/ContestList";
import Contest from "./pages/Contest";
import Submit from "./pages/Submit";
import Scoreboard from "./pages/Scoreboard";
<<<<<<< HEAD
=======
import Profile from "./pages/Profile";
import { AuthProvider } from "./context/AuthContext";
>>>>>>> origin/codex/review-project-and-provide-feedback-kmcakh
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

<<<<<<< HEAD
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
=======
function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<ContestList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contest/:id" element={<Contest />} />
          <Route path="/contest/:id/problem/:problemId" element={<Submit />} />
          <Route path="/scoreboard/:contestId" element={<Scoreboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </AuthProvider>
>>>>>>> origin/codex/review-project-and-provide-feedback-kmcakh
  );
}

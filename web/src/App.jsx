import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ContestList from "./pages/ContestList";
import Contest from "./pages/Contest";
import Submit from "./pages/Submit";
import Scoreboard from "./pages/Scoreboard";
import Profile from "./pages/Profile";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";

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
  );
}

export default App;

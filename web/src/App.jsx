import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ContestList from "./pages/ContestList";
import Contest from "./pages/Contest";
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
          </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

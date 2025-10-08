import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Vous devez être connecté pour accéder à cette page !");
    return <Navigate to="/login" />;
  }
  return children;
}

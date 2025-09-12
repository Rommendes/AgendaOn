// src/Routes/PrivateRoute.jsx

{/*import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute() {
const { user } = useAuth(); // implemente no contexto: user ou session do Supabase
return user ? <Outlet /> : <Navigate to="/" replace />;
}
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute() {
const { user, loading } = useAuth();

if (loading) {
  return <div className="p-6 text-center">Carregando...</div>;
}

return user ? <Outlet /> : <Navigate to="/" replace />;
}
*/}

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-center">Carregando...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/" replace />;
}

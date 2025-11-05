
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/routes";
import { AuthProvider } from "@/context/AuthContext";
import "material-icons/iconfont/material-icons.css";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}


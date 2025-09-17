import { Outlet } from "react-router-dom";
import Header from "../Componentes/Header/Header";

export default function PrivateLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Agenda de Atendimentos" />
      <main className="px-4 md:px-6 py-4">
        <Outlet />
      </main>
    </div>
  );
}

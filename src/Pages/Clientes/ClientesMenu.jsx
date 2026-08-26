import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Search, UserPlus, Users } from 'lucide-react';
import Header from '../../Componentes/Header/Header';

export default function ClientesMenu() {
  const [mostrarSubmenu, setMostrarSubmenu] = useState(false);
  const navigate = useNavigate();

  const toggleSubmenu = () => {
    setMostrarSubmenu(!mostrarSubmenu);
  };

  return (
    <>
      <Header title="Clientes" />
      <div className="main">
        <div className="main-container">
          <div className="mb-6 flex flex-col gap-4">
            <Link
              to="/busca-cliente"
              className="botao-menu w-full transition hover:scale-[1.02]"
            >
              <Search className="text-4xl text-secondary" size={32} />

              <div>
                <h1>Busca cliente</h1>
                <p>Pesquise o histórico e fianceiro do cliente</p>
              </div>
            </Link>

            <Link
              to="/cadastrar-cliente"
              className="botao-menu w-full transition hover:scale-[1.02]"
            >
              <UserPlus
                className="material-icons text-4xl text-secondary"
                size={35}
              />

              <div>
                <h1>Cadastro</h1>
                <p>Cadastre novos clientes</p>
              </div>
            </Link>

            <Link
              to="/lista-clientes"
              className="botao-menu w-full transition hover:scale-[1.02]"
            >
              <Users
                className="material-icons text-4xl text-secondary"
                size={35}
              />

              <div>
                <h1>Lista de Clientes</h1>
                <p>Veja todos os clientes cadastrados</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

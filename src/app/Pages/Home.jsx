import { Link} from "react-router-dom";
import { useState } from "react";
import minhaImagem from "@/assets/LogoCarmemAgenda.png"
import BotaoSair from "@/Componentes/common/BotaoSair";
import { CalendarCog, Minus, Sparkles } from "lucide-react"

export default function Home() {

  const [mostrarSubmenu, setMostrarSubmenu] = useState(false);


  const toggleSubmenu = () => {
    setMostrarSubmenu(!mostrarSubmenu);
  };

  return (
    <div className="bg-backgroundImage min-h-screen w-full flex justify-center items-center p-4">
      <div className="w-full max-w-md space-y-4">

        {/* Imagem e mensagem de boas-vindas */}
        <div className="inline-flex items-end gap-1">
          <img
            src={minhaImagem}
            alt="Imagem"
            className="py-1 rounded-xl w-[150px] h-[100px]"
          />
         <div className="flex flex-col justify-start">
            <h1 className=" text-lg font-semibold pb-3  text-md text-primary flex flex-wrap items-center justify-center">
              <Sparkles className="text-primary mx-2" />
              Agenda
              <span className="text-secondary font-bold">On</span>
              <Sparkles className="text-primary mx-2" />
              <span className="text-sm text-primary font-normal">
                mais que agenda, sua parceira de confiança.
              </span>
            </h1>
          </div>
        </div>

        {/* Botão de Agenda com submenu */}
      {<div className="w-full">
        <Link to="/agenda"
          onClick={toggleSubmenu}
          className="botao-menu w-full"
        >
          
          <span className="material-icons text-secondary text-4xl">event</span>
          <div className="flex flex-col justify-center text-left">
            <h2 className="font-bold text-lg">Agenda</h2>
            <p className="text-sm">Horários, serviços realizados e valores.</p>
          </div>
        </Link>

        
      </div>}

        {/* Outros botões */}
        <Link to="/busca-cliente" className="botao-menu w-full">
          <span className="material-icons text-secondary text-4xl">search</span>
          <div>
            <h2 className="font-bold text-lg">Busca cliente</h2>
            <p className="text-sm">Pesquisa o histórico do cliente cadastrado  </p>
          </div>
        </Link>

         <Link to="/agenda-semanal" className="botao-menu w-full">
          <CalendarCog className=" text-secondary text-4xl"/>
        
          <div>
            <h2 className="font-bold text-lg">Agenda Semanal</h2>
            <p className="text-sm">Pesquisa os atendimentos cadastrados  </p>
          </div>
        </Link>

        <Link to="/historico-semanal" className="botao-menu w-full">
          <span className="material-icons text-secondary text-4xl">history</span>
          <div>
            <h2 className="font-bold text-lg">Histórico Semanal de Agendamentos</h2>
            <p className="text-sm">Busca agendamentos semanais e valores recebidos</p>
          </div>
        </Link>

        <Link to="/cadastrar-cliente" className="botao-menu w-full">
          <span className="material-icons text-secondary text-4xl">person_add</span>
          <div>
            <h2 className="font-bold text-lg">Cadastro</h2>
            <p className="text-sm">Cadastro completo ou essencial</p>
          </div>
        </Link>

        <Link to="/lista-clientes" className="botao-menu w-full">
          <span className="material-icons text-secondary text-4xl">group</span>
          <div>
            <h2 className="font-bold text-lg">Lista de Clientes</h2>
            <p className="text-sm">Aqui encontra-se todos os clientes cadastrados</p>
          </div>

        </Link>
        <Link to="/cobrancas" className="botao-menu w-full">
          <span className="material-icons text-secondary text-4xl">group</span>
          <div>
            <h2 className="font-bold text-lg">Contas  Cobranças</h2>
            <p className="text-sm"> Aqui podemos enviar msg para contas Pendentes </p>
          </div>
        </Link>

        {/* Botão de sair */}
        <div className="flex justify-center">
          <BotaoSair />
        </div>
      </div>
    </div>
  );
}

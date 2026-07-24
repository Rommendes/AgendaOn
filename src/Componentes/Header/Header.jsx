import BtnHome from '../BotaoHome/BtnHome';
import BotaoSair from '../BotaoSair';
import { Link } from 'react-router-dom';
const Header = ({ title = 'Agenda de Atendimentos', actionButton = null }) => {
  return (
    <header className="mb-1 grid grid-cols-[1fr_auto_1fr] items-center bg-primary px-6 py-4 text-white">
      <Link to="/home" className="justify-self-start">
        <img
          src="/AgendaOn-simbolo-circulo-branco.png"
          alt="AgendaOn"
          className="h-10 w-10 object-contain"
        />
      </Link>

      <h2 className="text-center text-xl font-medium">{title}</h2>

      <div className="flex items-center gap-1 justify-self-end">
        {actionButton}
        <BtnHome />
        <BotaoSair />
      </div>
    </header>
  );
};
export default Header;

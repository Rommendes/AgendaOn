import BtnHome from '../BotaoHome/BtnHome';
import BotaoSair from '../BotaoSair';

const Header = ({ title = 'Agenda de Atendimentos', actionButton = null }) => {
  return (
    <header className="mb-1 flex items-center justify-between bg-primary px-6 py-4 text-2xl font-medium text-white">
      <h2 className="text-xl font-medium">{title}</h2>
      <div className="flex items-center gap-5">
        {actionButton && actionButton}
        <BtnHome />
        <BotaoSair />
      </div>
    </header>
  );
};
export default Header;

import BtnHome from "../BotaoHome/BtnHome";
import BotaoSair from "@/Componentes/common/BotaoSair";

const Header = ({title = 'Agenda de Atendimentos', actionButton = null}) => {
    return(
        <header className="bg-primary text-white py-4 px-6 flex justify-between items-center mb-6 rounded-lg">
      <h2 className="text-xl font-medium">{title}</h2>
      <div className="flex gap-5 items-center">
        {actionButton && actionButton}
        <BtnHome />
        <BotaoSair />
      </div>
    </header>
        
    )
}
export default Header;
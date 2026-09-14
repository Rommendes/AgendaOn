import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

import { supabase } from '../../api/supabaseClient';
import { createLogger } from '../../lib/logger';

const logger = createLogger('BotaoSair');

const BotaoSair = ({ modoMenu = false }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('Erro ao sair:', error);
      alert('Erro ao sair!');
    } else {
      navigate('/');
    }
  };

  if (modoMenu) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 px-5 py-3 text-left font-medium text-secondary transition hover:bg-secondary/10"
      >
        <LogOut size={20} />
        Sair
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      aria-label="Sair do sistema"
      className="w-fit rounded bg-secondary px-1.5 pt-1 text-primary shadow-lg hover:bg-alternativo"
    >
      <LogOut
        size={28}
        className="pb-2 text-2xl text-primary hover:text-secondary"
      />
    </button>
  );
};

export default BotaoSair;

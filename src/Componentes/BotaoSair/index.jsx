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
      title="Sair do sistema"
      className="btn-icone inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg border border-secondary px-3 text-sm font-medium text-secondary transition hover:bg-secondary/10 hover:text-primary"
    >
      <LogOut size={18} className="shrink-0" />
      <span>Sair</span>
    </button>
  );
};

export default BotaoSair;

import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient';
import { LogOut } from 'lucide-react';

import { createLogger } from '../../lib/logger';
const logger = createLogger('BotaoSai');

const BotaoSair = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('Erro ao sair:', error);
      alert('Erro ao sair!');
    } else {
      navigate('/'); // ✅ Redireciona corretamente
    }
  };

  return (
    <>
      <button
        onClick={handleLogout}
        className="w-fit rounded bg-secondary px-1.5 pt-1 text-primary shadow-lg hover:bg-alternativo"
      >
        <LogOut
          size={28}
          className="pb-2 text-2xl text-primary hover:text-secondary"
        />
      </button>
    </>
  );
};

export default BotaoSair;

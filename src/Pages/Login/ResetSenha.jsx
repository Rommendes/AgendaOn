import { useState } from 'react';
import { supabase } from '../../api/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function ResetSenha() {
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const salvarNovaSenha = async () => {
    setMsg('');
    if (!senha.trim() || senha.length < 6) {
      setMsg('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg('Senha atualizada! Faça login novamente.');
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-8">
        <h2 className="text-center text-2xl font-bold uppercase text-primary">
          Redefinir senha
        </h2>

        {msg && <p className="mt-4 text-center text-sm">{msg}</p>}

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-gray-700">Nova senha</label>
            <input
              type="password"
              className="w-full rounded-lg border border-cinza border-b-secondary p-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={salvarNovaSenha}
              className="w-fit rounded-lg bg-secondary p-3 text-primary shadow-2xl transition-all duration-300 hover:bg-alternativo"
            >
              Salvar nova senha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

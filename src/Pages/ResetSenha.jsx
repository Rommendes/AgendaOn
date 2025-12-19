import { useState } from "react";
import { supabase } from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetSenha() {
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const salvarNovaSenha = async () => {
    setMsg("");
    if (!senha.trim() || senha.length < 6) {
      setMsg("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg("Senha atualizada! Faça login novamente.");
    navigate("/", { replace: true });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-6 sm:p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-primary uppercase">
          Redefinir senha
        </h2>

        {msg && <p className="text-sm text-center mt-4">{msg}</p>}

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-gray-700">Nova senha</label>
            <input
              type="password"
              className="w-full p-3 border border-cinza border-b-secondary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={salvarNovaSenha}
              className="w-fit bg-secondary text-primary p-3 rounded-lg hover:bg-alternativo transition-all duration-300 shadow-2xl"
            >
              Salvar nova senha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

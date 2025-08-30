import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"
import { supabase } from "../api/supabaseClient";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch {
      setError("Email ou senha inválidos.");
    }
  };
 

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Erro ao sair:", error);
      alert("Erro ao sair!");
    } else {
     
      navigate("/home"); // ✅ Redireciona corretamente
    }
  };

  return (
    <>
      <style>{`
        body {
          
          min-height: 100vh;
          
          align-items: center;
        }
      `}</style>

    <div className="bg-backgroundImage flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-6 sm:p-8  w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-primary uppercase">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4 mt-4 py-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full p-3 border border-cinza border-b-secondary rounded-lg focus:ring-2 focus:ring-primary  focus:outline-none"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Senha</label>
            <input
              type="password"
              className="w-full p-3 border border-cinza border-b-secondary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleLogout}
              type="submit"
              className="w-fit bg-secondary text-white p-3 rounded-lg hover:bg-alternativo transition-all duration-300 shadow-2xl"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default Login;

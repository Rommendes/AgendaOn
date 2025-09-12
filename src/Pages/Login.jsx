 /*import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"
import { supabase } from "../api/supabaseClient";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
   const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

     //🟣 validação simples
    if (!email.trim() || !password.trim()) {
      setError("Preencha e-mail e senha.");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate("/home"); // redireciona só se autenticar
    } catch (err) {
      setError("Email ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };
   //🟣 Use este logout em um botão/menú próprio dentro da Home, NÃO no botão de login
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao sair:", error);
      alert("Erro ao sair!");
    } else {
      navigate("/"); // após sair, volte ao login
    }
  };
  

 
  return (
    <div className="bg-backgroundImage flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-6 sm:p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-primary uppercase">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4 mt-4 py-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              autoComplete="email"
              className="w-full p-3 border border-cinza border-b-secondary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
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
              autoComplete="current-password"
              className="w-full p-3 border border-cinza border-b-secondary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"                    // ✅ sem onClick aqui
              disabled={loading || !email.trim() || !password.trim()}
              className="w-fit bg-secondary text-primary p-3 rounded-lg hover:bg-alternativo transition-all duration-300 shadow-2xl "
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
*/

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/home", { replace: true });
    }
  }, [loading, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Preencha e-mail e senha.");
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
      navigate("/home", { replace: true });
    } catch (err) {
      setError("Email ou senha inválidos.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-backgroundImage flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-6 sm:p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-primary uppercase">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4 mt-4 py-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              autoComplete="email"
              className="w-full p-3 border border-cinza border-b-secondary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
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
              autoComplete="current-password"
              className="w-full p-3 border border-cinza border-b-secondary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitting || !email.trim() || !password.trim()}
              className="w-fit bg-secondary text-primary p-3 rounded-lg hover:bg-alternativo transition-all duration-300 shadow-2xl "
            >
              {submitting ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

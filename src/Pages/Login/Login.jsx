import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const { login, user, loading, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/home', { replace: true });
    }
  }, [loading, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha.');
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
      navigate('/home', { replace: true });
    } catch (err) {
      setError('Email ou senha inválidos.');
    } finally {
      setSubmitting(false);
    }
  };
  const handleResetSenha = async () => {
    setError('');

    if (!email.trim()) {
      setError('Digite seu e-mail para receber o link de recuperação.');
      return;
    }

    try {
      await resetPassword(email.trim());
      setError('Enviei um link de recuperação para seu e-mail.');
    } catch (err) {
      setError(
        err?.message || 'Não foi possível enviar o link de recuperação.'
      );
    }
  };

  return (
    <div className="bg-backgroundImage flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-8">
        <h2 className="text-center text-2xl font-bold uppercase text-primary">
          Login
        </h2>

        <form onSubmit={handleLogin} className="mt-4 space-y-4 py-4">
          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-cinza border-b-secondary p-3 focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="w-full rounded-lg border border-cinza border-b-secondary p-3 focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="w-fit rounded-lg bg-secondary p-3 text-primary shadow-2xl transition-all duration-300 hover:bg-alternativo"
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleResetSenha}
                className="text-sm text-primary underline hover:opacity-80"
              >
                Esqueci minha senha
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

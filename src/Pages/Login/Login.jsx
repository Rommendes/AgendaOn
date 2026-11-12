import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, LogIn, Mail } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import logoAgendaOn from '../../assets/logoAgendaOn.png';

const Login = () => {
  const navigate = useNavigate();

  const { login, user, loading, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/home', { replace: true });
    }
  }, [loading, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    setMensagem('');
    setTipoMensagem('');

    if (!email.trim() || !password.trim()) {
      setMensagem('Preencha o e-mail e a senha.');
      setTipoMensagem('erro');
      return;
    }

    try {
      setSubmitting(true);

      await login(email.trim(), password);

      navigate('/home', { replace: true });
    } catch {
      setMensagem('E-mail ou senha inválidos.');
      setTipoMensagem('erro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSenha = async () => {
    setMensagem('');
    setTipoMensagem('');

    if (!email.trim()) {
      setMensagem('Digite seu e-mail para receber o link de recuperação.');
      setTipoMensagem('erro');
      return;
    }

    try {
      setEnviandoRecuperacao(true);

      await resetPassword(email.trim());

      setMensagem(
        'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.'
      );
      setTipoMensagem('sucesso');
    } catch {
      setMensagem('Não foi possível enviar o link agora. Tente novamente.');
      setTipoMensagem('erro');
    } finally {
      setEnviandoRecuperacao(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary/5">
        <p className="text-sm font-medium text-primary">Carregando...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 via-white to-secondary/20 px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-primary/35 bg-white p-6 shadow-xl sm:p-8">
        <div className="text-center">
          <img
            src={logoAgendaOn}
            alt="AgendaOn"
            className="mx-auto h-auto w-52"
          />

          <h1 className="mt-5 text-2xl font-bold text-primary">
            Acesse sua conta
          </h1>

          <p className="mt-1 text-sm text-cinza/70">
            Entre para gerenciar sua agenda e seus clientes.
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-7 space-y-5">
          {mensagem && (
            <div
              role="status"
              aria-live="polite"
              className={`rounded-lg border px-3 py-2 text-center text-sm ${
                tipoMensagem === 'sucesso'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-600'
              }`}
            >
              {mensagem}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-primary"
            >
              E-mail
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
              />

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-padrao w-full pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-primary"
            >
              Senha
            </label>

            <div className="relative">
              <LockKeyhole
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
              />

              <input
                id="password"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-padrao w-full pl-10 pr-11"
                required
              />

              <button
                type="button"
                onClick={() => setMostrarSenha((anterior) => !anterior)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cinza/60 transition hover:text-primary"
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || enviandoRecuperacao}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 font-medium text-white shadow-md transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogIn size={19} />

            {submitting ? 'Entrando...' : 'Entrar'}
          </button>

          <button
            type="button"
            onClick={handleResetSenha}
            disabled={submitting || enviandoRecuperacao}
            className="w-full text-center text-sm font-medium text-primary underline-offset-4 transition hover:text-secondary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviandoRecuperacao ? 'Enviando link...' : 'Esqueci minha senha'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Login;

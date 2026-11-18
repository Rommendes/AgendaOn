import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [vinculo, setVinculo] = useState({
    usuarioId: null,
    empresa: null,
    papel: null,
    erro: '',
  });

  useEffect(() => {
    let ativo = true;
    let recebeuEvento = false;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        recebeuEvento = true;

        if (!ativo) return;

        setUser(session?.user || null);
        setLoadingAuth(false);
      }
    );

    const bootstrap = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (!ativo || recebeuEvento) return;
        if (error) throw error;

        setUser(data.user || null);
      } catch {
        if (ativo && !recebeuEvento) {
          setUser(null);
        }
      } finally {
        if (ativo && !recebeuEvento) {
          setLoadingAuth(false);
        }
      }
    };

    bootstrap();

    return () => {
      ativo = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const usuarioId = user?.id;

  useEffect(() => {
    let ativo = true;

    if (!usuarioId) {
      setVinculo({
        usuarioId: null,
        empresa: null,
        papel: null,
        erro: '',
      });

      return () => {
        ativo = false;
      };
    }

    const carregarEmpresa = async () => {
      try {
        const { data, error } = await supabase
          .from('empresa_usuarios')
          .select(
            `
            empresa_id,
            papel,
            empresa:empresas (
              id,
              nome
            )
          `
          )
          .eq('usuario_id', usuarioId)
          .limit(2);

        if (error) throw error;

        if (!data?.length) {
          throw new Error('Seu usuário ainda não está vinculado a um salão.');
        }

        if (data.length > 1) {
          throw new Error(
            'Seu usuário possui mais de um salão. A seleção de empresa precisa ser configurada.'
          );
        }

        const registro = data[0];

        if (!registro.empresa) {
          throw new Error('Não foi possível consultar os dados do salão.');
        }

        if (!ativo) return;

        setVinculo({
          usuarioId,
          empresa: registro.empresa,
          papel: registro.papel,
          erro: '',
        });
      } catch (error) {
        if (!ativo) return;

        setVinculo({
          usuarioId,
          empresa: null,
          papel: null,
          erro: error.message || 'Não foi possível carregar o salão.',
        });
      }
    };

    carregarEmpresa();

    return () => {
      ativo = false;
    };
  }, [usuarioId]);

  // Só expõe os dados que pertencem ao usuário atual.
  const vinculoAtual = Boolean(usuarioId) && vinculo.usuarioId === usuarioId;

  const empresa = vinculoAtual ? vinculo.empresa : null;
  const papel = vinculoAtual ? vinculo.papel : null;
  const erroEmpresa = vinculoAtual ? vinculo.erro : '';

  const loadingEmpresa = Boolean(usuarioId) && !vinculoAtual;
  const loading = loadingAuth || loadingEmpresa;

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    setUser(null);
    setVinculo({
      usuarioId: null,
      empresa: null,
      papel: null,
      erro: '',
    });
  };

  const resetPassword = async (email) => {
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/reset-senha`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        empresa,
        empresaId: empresa?.id || null,
        papel,
        erroEmpresa,
        loading,
        loadingEmpresa,
        login,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

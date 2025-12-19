
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../api/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // controla estado inicial

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user || null);
      setLoading(false);
    };
    bootstrap();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // login com email/senha (Supabase)
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // data.session?.user já será capturado pelo onAuthStateChange
    return data;
  };

  // logout
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  //resetPassword
  const resetPassword = async (email) => {
    const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/reset-senha`
      : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-senha`,
  });
  if (error) throw error;
};


  return (
    <AuthContext.Provider value={{ user, loading, login, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

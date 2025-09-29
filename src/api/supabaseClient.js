import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: window.localStorage,
    detectSessionInUrl: false,
  },
});



// Buscar agendamentos pendentes (pagamento = 'Não pagou')
export async function getAgendamentosPendentes() {
  const { data, error } = await supabase
    .from("agendamentos")
    .select(`
      id,
      data,
      horario,
      pagamento,
      valor,
      cliente_id,
      servico,
      obs,
      clientes (
        nome,
        telefone
      )
    `)
    .eq("pagamento", "Não pagou");

  if (error) {
    console.error("Erro ao buscar agendamentos pendentes:", error.message);
    return [];
  }
  return data ?? [];
}
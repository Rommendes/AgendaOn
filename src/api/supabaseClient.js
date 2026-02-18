import { createClient } from "@supabase/supabase-js";
import { createLogger } from "../lib/logger";

const logger =createLogger("Supabase");


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

logger.debug("SUPABASE_URL:", supabaseUrl);
logger.debug("SUPABASE_KEY_OK:", !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: window.localStorage,
    detectSessionInUrl: true,
  },
});



// Buscar agendamentos pendentes (pagamento = 'PENDENTE')
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
    .eq("pagamento", "PENDENTE")
    // .order("data", { ascending: true })
    // .order("horario", { ascending: true });

  if (error) {
    logger.error("Erro ao buscar agendamentos pendentes:", error.message);
    return [];
  }
  console.log("AGENDAMENTOS (SEM FILTRO):", data);

  return data ?? [];

  
}


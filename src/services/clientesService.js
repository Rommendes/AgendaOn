import { supabase } from "@/lib/supabaseClient";

/** Lista todos os clientes em ordem alfabética */
export async function listarClientes() {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("nome", { ascending: true });

  if (error) throw error;
  return data || [];
}

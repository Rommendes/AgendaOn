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
export async function criarCliente(novo) {
  // `novo` é um objeto com os campos da tabela (nome, telefone, etc.)
  const { data, error } = await supabase
    .from("clientes")
    .insert([novo])
    .select()
    .single(); // retorna 1 registro

  if (error) throw error;
  return data;
}
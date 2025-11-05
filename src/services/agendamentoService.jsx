import { supabase } from '@/lib/supabaseClient'

export async function getAgendamentosPendentes() {
  const { data, error } = await supabase
    .from('agendamentos')
    .select('*, clientes:cliente_id(nome, telefone)')
    .eq('pagamento', 'pendente')
    .order('data', { ascending: true })
    .order('hora', { ascending: true })

  if (error) throw error
  return data || []
}
EOF
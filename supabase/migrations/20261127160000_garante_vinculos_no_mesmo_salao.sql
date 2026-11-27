-- Requer PostgreSQL 15 ou superior.
-- Requer empresa_id preenchido e vínculos existentes no mesmo salão.
-- Preserva o histórico ao excluir clientes ou agendamentos.

begin;

alter table public.clientes
  add constraint clientes_empresa_id_id_key
  unique (empresa_id, id);

alter table public.agendamentos
  add constraint agendamentos_empresa_id_id_key
  unique (empresa_id, id);

-- Agendamento e cliente devem pertencer ao mesmo salão.

alter table public.agendamentos
  drop constraint fk_cliente;

alter table public.agendamentos
  add constraint fk_cliente
  foreign key (empresa_id, cliente_id)
  references public.clientes (empresa_id, id)
  on delete set null (cliente_id);

-- Histórico e cliente devem pertencer ao mesmo salão.

alter table public.lembretes_enviados
  drop constraint lembretes_enviados_cliente_id_fkey;

alter table public.lembretes_enviados
  add constraint lembretes_enviados_cliente_id_fkey
  foreign key (empresa_id, cliente_id)
  references public.clientes (empresa_id, id)
  on delete set null (cliente_id);

-- Histórico e agendamento devem pertencer ao mesmo salão.

alter table public.lembretes_enviados
  drop constraint lembretes_enviados_agendamento_id_fkey;

alter table public.lembretes_enviados
  add constraint lembretes_enviados_agendamento_id_fkey
  foreign key (empresa_id, agendamento_id)
  references public.agendamentos (empresa_id, id)
  on delete set null (agendamento_id);

commit;
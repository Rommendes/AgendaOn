-- Requer as tabelas, a coluna empresa_id e as políticas já existentes.
-- Requer RLS ativada e leitura dos próprios vínculos em empresa_usuarios.
-- Antes de aplicar, todos os registros devem ter empresa_id preenchido.

begin;

alter table public.clientes
  alter column empresa_id set not null;

alter table public.agendamentos
  alter column empresa_id set not null;

alter table public.lembretes_enviados
  alter column empresa_id set not null;

-- CLIENTES

alter policy "Clientes: leitura autenticada"
on public.clientes
using (
  exists (
    select 1 from public.empresa_usuarios eu
    where eu.empresa_id = clientes.empresa_id
      and eu.usuario_id = (select auth.uid())
  )
);

alter policy "Clientes: cadastro autenticado"
on public.clientes
with check (
  exists (
    select 1 from public.empresa_usuarios eu
    where eu.empresa_id = clientes.empresa_id
      and eu.usuario_id = (select auth.uid())
  )
);

alter policy "Clientes: edição autenticada"
on public.clientes
using (
  exists (
    select 1 from public.empresa_usuarios eu
    where eu.empresa_id = clientes.empresa_id
      and eu.usuario_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.empresa_usuarios eu
    where eu.empresa_id = clientes.empresa_id
      and eu.usuario_id = (select auth.uid())
  )
);

alter policy "Clientes: exclusão autenticada"
on public.clientes
using (
  exists (
    select 1 from public.empresa_usuarios eu
    where eu.empresa_id = clientes.empresa_id
      and eu.usuario_id = (select auth.uid())
  )
);

-- AGENDAMENTOS

alter policy "Agendamentos: leitura autenticada"
on public.agendamentos
using (
  exists (
    select 1 from public.empresa_usuarios eu
    where eu.empresa_id = agendamentos.empresa_id
      and eu.usuario_id = (select auth.uid())
  )
);

alter policy "Agendamentos: cadastro autenticado"
on public.agendamentos
with check (
  exists (
    select 1 from public.empresa_usuarios eu
    where eu.empresa_id = agendamentos.empresa_id
      and eu.usuario_id = (select auth.uid())
  )
);

alter policy "Agendamentos: edição autenticada"
on public.agendamentos
using (
  exists (
    select 1 from public.empresa_usuarios eu
    where eu.empresa_id = agendamentos.empresa_id
      and eu.usuario_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.empresa_usuarios eu
    where eu.empresa_id = agendamentos.empresa_id
      and eu.usuario_id = (select auth.uid())
  )
);

alter policy "Agendamentos: exclusão autenticada"
on public.agendamentos
using (
  exists (
    select 1 from public.empresa_usuarios eu
    where eu.empresa_id = agendamentos.empresa_id
      and eu.usuario_id = (select auth.uid())
  )
);

-- HISTÓRICO DE LEMBRETES

alter policy "Lembretes: leitura autenticada"
on public.lembretes_enviados
using (
  exists (
    select 1 from public.empresa_usuarios eu
    where eu.empresa_id = lembretes_enviados.empresa_id
      and eu.usuario_id = (select auth.uid())
  )
);

alter policy "Lembretes: cadastro autenticado"
on public.lembretes_enviados
with check (
  exists (
    select 1 from public.empresa_usuarios eu
    where eu.empresa_id = lembretes_enviados.empresa_id
      and eu.usuario_id = (select auth.uid())
  )
);

commit;
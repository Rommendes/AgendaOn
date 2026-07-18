# 📖 Diário do Projeto

Este documento registra as principais decisões tomadas durante o desenvolvimento do AgendaOn.

Seu objetivo é preservar o contexto das escolhas realizadas, facilitando futuras manutenções e garantindo a consistência do projeto.

⚠️O Diário do Projeto responde:
"Por que decidimos fazer assim?"

---

## 2026-07-19

### Documentação

Foi criada a pasta `docs` para centralizar toda a documentação do projeto.

**Motivo**

Organizar a evolução do sistema e facilitar futuras consultas.

---

### Guia de Padronização

Foi decidido criar um Guia de Padronização antes da conclusão das telas.

**Motivo**

Garantir consistência visual e reduzir retrabalho.

---

### Identidade Visual

As cores deixaram de ser apenas decorativas e passaram a representar estados do sistema.

- 🔵 Primary → Identidade
- 🟠 Secondary → Ações
- 🟢 Success → Confirmações
- 🟡 Warning → Pendências
- 🔴 Danger → Erros e cancelamentos

**Motivo**

Facilitar a interpretação da interface pelo usuário.

---

### Pagamentos

Foi mantida a opção **"Pendente"** na tela de pagamentos.

**Motivo**

A rotina dos salões permite que clientes combinem pagamentos posteriores. O sistema deve refletir essa realidade.

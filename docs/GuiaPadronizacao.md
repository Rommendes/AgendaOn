# 📘 Guia de Padronização

⚠️O Guia de Padronização responde:
"Como fazemos?"

## AgendaOn

> Versão 1.0

---

## Objetivo

Este documento define os padrões visuais e de usabilidade do AgendaOn.

Seu objetivo é garantir que todas as telas do sistema mantenham a mesma identidade visual, proporcionando uma experiência intuitiva para o usuário e facilitando a manutenção e evolução do projeto.

---

# Princípios

O AgendaOn foi desenvolvido para atender à rotina de profissionais da beleza.

Toda decisão de interface deve seguir estes princípios:

- Simplicidade
- Clareza
- Agilidade
- Consistência
- Facilidade de aprendizado

Antes de adicionar uma nova funcionalidade, faça as seguintes perguntas:

- Esta tela facilita o trabalho da profissional?
- A informação mais importante está em destaque?
- O usuário consegue entender a tela sem precisar de explicações?
- Esta tela segue o padrão visual do restante do sistema?

Caso a resposta seja **não**, a interface deverá ser revisada.

---

# 🎨 Identidade Visual

A identidade visual do AgendaOn deve transmitir organização, confiança e simplicidade.

As cores não são apenas elementos decorativos. Cada uma possui um significado dentro do sistema.

| Cor | Nome      | Utilização                                                |
| --- | --------- | --------------------------------------------------------- |
| 🔵  | Primary   | Identidade visual, títulos, ícones e destaques            |
| 🟠  | Secondary | Botões de ação e chamadas principais                      |
| 🟢  | Success   | Confirmações, pagamentos recebidos e mensagens de sucesso |
| 🟡  | Warning   | Pendências, avisos e situações que exigem atenção         |
| 🔴  | Danger    | Erros, cancelamentos e ações destrutivas                  |

## Regra Geral

Uma mesma cor deve possuir sempre o mesmo significado em todo o sistema.

O usuário deve conseguir identificar o estado de uma informação apenas observando suas cores.

# 📐 Estrutura das Páginas

Todas as páginas do AgendaOn deverão seguir a mesma organização visual.

## Estrutura

```
Header

↓

Título da página

↓

Descrição da página

↓

Conteúdo principal

↓

Ações (quando necessário)
```

## Objetivo

Padronizar a navegação para que o usuário saiba sempre onde encontrar as informações.

Uma nova tela não deve exigir aprendizado. Ela deve seguir o mesmo padrão das demais.

---

## Cabeçalho (Header)

O Header é responsável pela navegação do sistema.

Ele deve permanecer igual em todas as páginas.

---

## Título da Página

Cada página deve possuir um título claro e objetivo.

Exemplos:

- Agenda
- Clientes
- Pagamentos
- Financeiro
- Histórico

---

## Descrição

Logo abaixo do título, deve existir uma breve descrição explicando o objetivo da tela.

Exemplo:

> Registre os recebimentos dos atendimentos concluídos.

---

## Conteúdo

O conteúdo principal deverá ser organizado utilizando Cards.

Evitar telas longas e poluídas.

Sempre que possível, dividir grandes informações em blocos menores.

---

## Ações

Botões de ação devem permanecer próximos às informações que representam.

Evitar botões espalhados pela tela.

O usuário deve compreender facilmente qual ação será executada.

# 📦 Cards

## Conceito

Os cards são o principal componente visual do AgendaOn.

Eles organizam informações relacionadas em blocos independentes, tornando a leitura mais agradável e facilitando a localização das informações pelo usuário.

Sempre que possível, o conteúdo de uma tela deverá ser apresentado em cards.

---

## Padrão

Os cards do AgendaOn devem possuir:

- Fundo branco;
- Bordas discretas;
- Cantos arredondados;
- Sombra suave;
- Espaçamento interno confortável;
- Distância uniforme entre um card e outro.

Exemplo de classes utilizadas:

```jsx
rounded-2xl
bg-white
border
border-slate-200
shadow-sm
p-5
```

---

## Motivo

Os cards reduzem a sensação de excesso de informações.

Ao dividir o conteúdo em blocos menores, o usuário consegue identificar rapidamente onde está a informação que procura.

Esse padrão melhora a leitura tanto em computadores quanto em dispositivos móveis.

---

## Regras

- Cada card deve representar apenas um assunto.
- Evitar colocar informações não relacionadas no mesmo card.
- Não utilizar sombras muito fortes.
- Manter espaçamentos consistentes entre os elementos internos.
- Sempre que possível utilizar títulos.

---

## Estrutura

Todo card deve seguir a estrutura:

Título

Conteúdo

Ações (quando existirem)

---

## Exemplos de utilização

O componente Card é utilizado em:

- Agenda
- Pagamentos
- Financeiro
- Clientes
- Histórico
- Lembretes

---

## Boas práticas

✔ Utilizar títulos curtos.

✔ Destacar a informação mais importante.

✔ Agrupar informações relacionadas.

✔ Evitar excesso de texto.

✔ Utilizar ícones apenas quando ajudarem na identificação da informação.

---

## Evitar

✖ Cards muito altos.

✖ Informações sem alinhamento.

✖ Misturar várias funcionalidades dentro do mesmo card.

✖ Excesso de cores.

## 📌 Decisões do Projeto

Durante o desenvolvimento do AgendaOn foi definido que:

- Os cards serão o principal componente visual do sistema.
- Novas telas deverão priorizar o uso de cards em vez de grandes tabelas.
- Sempre que possível, ações devem permanecer dentro do próprio card ao qual pertencem.

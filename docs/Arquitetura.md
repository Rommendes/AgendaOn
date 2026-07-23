# 🗄️ Banco de Dados

# 🏗️ Arquitetura do AgendaOn

## Objetivo

Este documento descreve a organização da aplicação AgendaOn.

Seu objetivo é facilitar a manutenção, orientar futuras implementações e preservar a estrutura do projeto.

---

## Cada pasta possui uma única responsabilidade. Antes de criar uma nova pasta, verifique se sua finalidade não está contemplada por uma pasta já existente

# Estrutura do Projeto

```
AgendaOn
│
├── docs
├── public
├── src
├── README.md
└── ...
```

---

# Estrutura da pasta src

```
src
├── api (Responsável pela comunicação com serviços externos.)

├── assets (Armazena recursos estáticos utilizados pela aplicação. Ex:
            - imagens
            - ícones
            - sons
            - logotipos)

├── Componentes(Contém componentes reutilizáveis utilizados em diferentes páginas.)

├── context(Responsável pelo compartilhamento de estados globais, como autenticação.)

├── lib(Contém bibliotecas e configurações compartilhadas.Ex: logger)

├── Pages(Representa as telas, pgs do sistema. Cada arquivo corresponde a uma tela acessada pelo usuário.)

├── PrivateLayout(É o layout usado pelas páginas privadas do sistema, reunindo o cabeçalho e a área onde as rotas internas são exibidas.)

    ├── utils(Contém funções auxiliares reutilizáveis. Ex:
            - formatarTelefone
            - formatarValor
            - getDiaSemanaComData
            )
├── PrivateLayout(Define a estrutura comum das páginas privadas da aplicação. Responsável por exibir:
            - Header
            - Área principal (`main`)
            - Outlet das rotas)

```

> Em construção.

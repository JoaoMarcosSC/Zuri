---
name: zuri-tela
description: Cria uma tela ou funcionalidade Angular (rota, componente, serviço) usando só os componentes e tokens do Zuri, a partir das receitas prontas (formulário, tabela com CRUD, dashboard, login, lista e detalhe). Use quando a pessoa pedir uma tela, página, formulário, listagem ou painel.
---

# Criar uma tela com o Zuri

## Antes de escrever
1. Leia `node_modules/@juau/zuri/ai/regras.md`.
2. Escolha a receita mais próxima em `node_modules/@juau/zuri/ai/receitas/`:
   `formulario.md`, `crud-tabela.md`, `dashboard.md`, `autenticacao.md`, `lista-detalhe.md`.
   Se nenhuma servir, combine peças e consulte o `catalogo.md`.
3. Se for uma página nova e o layout não estiver decidido, siga a skill **zuri-layout** primeiro.
4. Confira no projeto: onde ficam as páginas (`src/app/...`), como as rotas são registradas, se já há
   serviços de API e modelos para reaproveitar.

Se faltar informação essencial (quais campos, quais colunas, de onde vêm os dados), pergunte, uma
pergunta por vez. Não invente regras de negócio: deixe `// TODO:` claro onde a pessoa precisa decidir.

## Ao escrever
- Componente standalone, `OnPush`, estado em `signal()`; imports só do que o template usa.
- Formulários com Signal Forms (`form()` + `[formField]`), mensagens de erro nas regras (`message`),
  erro visível só depois de tocar no campo, envio com `submit()`.
- Dados de API num serviço com `HttpClient` (um por recurso), nunca `fetch` solto no componente.
- Estados: carregando (`tbody[zurTableSkeleton]` ou `zur-skeleton`), vazio (`zur-empty-state`), erro
  (`ZurToastService` ou `zur-alert`), confirmação destrutiva (`ZurDialog.confirm` com `destructive`).
- CSS só com tokens; propriedades lógicas (RTL).
- Textos da tela no idioma do produto.

## Depois de escrever
1. Registre a rota (preferindo `loadComponent` para páginas). Se o app tem SSR (`app.routes.server.ts`) e a tela
   busca dados da API, declare a rota com `RenderMode.Client` (ou `Server`), nunca `Prerender`.
2. Rode `ng build` e corrija até passar sem erros.
3. Se houver testes, rode; se o projeto tiver o padrão de testar telas, crie um teste simples.
4. Se o agent **zuri-revisor** existir, peça revisão dos arquivos novos.
5. Diga o que criou, onde, e como abrir a tela.

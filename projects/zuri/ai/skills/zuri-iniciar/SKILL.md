---
name: zuri-iniciar
description: Ponto de partida para montar ou mudar a interface de um projeto Angular com o design system Zuri (@juau/zuri). Use quando a pessoa quiser começar o frontend, criar as primeiras telas, aplicar o Zuri num projeto que já existe, gerar telas a partir de uma API, ou não souber por onde começar.
---

# Começar com o Zuri

Você conduz a pessoa do zero até as primeiras telas prontas, usando os componentes do Zuri.
Responda no idioma da pessoa. Uma pergunta por vez, com 2 a 4 opções e a sua recomendação.

## 0. Material de referência
- O material do Zuri está em `node_modules/@juau/zuri/ai/` (se não existir, procure o arquivo
  `catalogo.md` dentro de `node_modules/@juau/zuri`; em monorepo pode estar num `node_modules` acima).
- Leia **antes de tudo** `regras.md`. O `catalogo.md` é grande: consulte por seletor quando for usar
  um componente. Não invente API.
- O bloco do Zuri no `AGENTS.md` diz o **modo de tema** (claro, escuro ou ambos). Não pergunte de novo.

## 1. Descubra a situação antes de perguntar
Investigue sem alterar nada:
- `package.json`: versão do Angular; outras bibliotecas de UI (`@angular/material`, `bootstrap`,
  `primeng`, `tailwindcss`); se `@juau/zuri` está instalado (se não, oriente `ng add @juau/zuri`).
- `angular.json` e `src/app`: quantas rotas e componentes já existem.
- Sinais de backend: `openapi.json|yaml`, `swagger.*`, pastas `api/`, `server/`, `backend/`, controllers
  (`@Controller` Nest, `express.Router`, `@RestController` Spring, `[ApiController]` .NET, `@app.get`
  FastAPI), ou uma URL de API em `environment*.ts`.

Diga o que encontrou em uma frase e confirme a situação:
1. **Projeto do zero**: não há telas.
2. **Só tem backend**: há uma API e falta o frontend.
3. **Já tem frontend**: há telas e a pessoa quer aplicar o Zuri.

## 2. Entenda o produto
Pergunte, uma de cada vez (pule o que já ficou claro):
- O que o produto faz e para quem (uso diário interno, cliente final, visitante ocasional).
- Quais telas a primeira entrega precisa. Sugira a lista a partir do que encontrou: entidades da API,
  rotas que já existem, fluxos comuns (login, lista, detalhe, formulário, painel).
- O uso no celular importa? (Se sim: `zur-bottom-nav` para 3 a 5 destinos, `zur-drawer side="bottom"`.)

## 3. Plano
Apresente um plano curto e peça confirmação:
- telas em ordem de entrega, com o **layout** de cada uma (`layouts.md`) e a **receita** de base
  (`receitas/`);
- o que será criado ou alterado (rotas, serviços, componentes);
- o que fica para depois.

## 4. Execute pelo fluxo da situação
- **Do zero:** prepare o shell (rotas, `provideHttpClient()` se houver API, `<zur-toast-container />` no
  componente raiz) e crie cada tela seguindo a skill **zuri-tela** (para escolher layout, **zuri-layout**).
- **Só backend:** siga a skill **zuri-backend**.
- **Já tem frontend:** siga a skill **zuri-migrar**.

As skills ficam em `.claude/skills/<nome>/SKILL.md` (Claude Code) e `.agents/skills/<nome>/SKILL.md`
(Codex). Se não puder chamá-las, leia o arquivo e siga as instruções.

## 5. Feche cada etapa
- Rode `ng build` (e os testes, se existirem) depois de cada tela. Corrija antes de seguir.
- Se o agent **zuri-revisor** existir, peça uma revisão das telas novas.
- Resuma o que foi criado, onde, e qual é o próximo passo.

## Nunca
- Apagar ou reescrever código da pessoa sem confirmar.
- Criar componente próprio para algo que o Zuri já tem.
- Usar cores fixas, sombras próprias ou outra biblioteca de ícones.

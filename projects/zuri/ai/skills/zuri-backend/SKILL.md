---
name: zuri-backend
description: Monta o frontend Angular com o Zuri a partir de um backend existente - lê a API (OpenAPI/Swagger ou as rotas no código) e gera modelos, serviços HttpClient e telas de lista, detalhe e formulário. Use quando o projeto só tem backend ou a pessoa quer telas para os endpoints de uma API.
---

# Frontend a partir da API

Antes de gerar qualquer tela, leia `node_modules/@juau/zuri/ai/regras.md` e use só componentes do
`catalogo.md` do Zuri (procure pelo seletor). As telas seguem as receitas em
`node_modules/@juau/zuri/ai/receitas/`.

## 1. Ache o contrato
Procure, nesta ordem, e diga o que encontrou:
1. Arquivo OpenAPI/Swagger (`openapi.json|yaml`, `swagger.json`, `docs/api*`) ou uma URL dele
   (`/v3/api-docs`, `/swagger.json`, `/openapi.json`). Se a pessoa tiver a URL, peça.
2. Rotas no código do backend: Nest (`@Controller`, `@Get`…), Express/Fastify (`router.get`…),
   Spring (`@RestController`, `@GetMapping`…), ASP.NET (`[ApiController]`, `[HttpGet]`…), FastAPI/Flask
   (`@app.get`, `@router.post`…), Laravel/Rails (arquivos de rotas).
3. Se não houver nada legível, peça exemplos de requisição e resposta.

Monte uma tabela de **recursos** (entidade → endpoints de listar, obter, criar, alterar, excluir; campos
e tipos; paginação; autenticação). Mostre à pessoa e confirme quais recursos entram primeiro.

## 2. Base do app
- `provideHttpClient(withInterceptors([...]))` no `app.config.ts`; URL base em `environment` ou num
  `InjectionToken`. Autenticação: interceptor que anexa o token, se a API exigir.
- Shell: layout de área logada (`zur-dashboard-layout`, veja a skill **zuri-layout**) com um item de menu
  por recurso; tela de login (`receitas/autenticacao.md`) se houver autenticação.
- `<zur-toast-container />` no componente raiz.
- Se o app tem SSR (`app.routes.server.ts`), as rotas que buscam dados da API usam `RenderMode.Client` (ou
  `RenderMode.Server` se a API for alcançável pelo servidor), não `Prerender`.

## 3. Um recurso por vez
Para cada recurso confirmado:
1. **Modelo** TypeScript a partir do esquema (nomes e tipos reais; datas como `string` ISO ou `Date`,
   decidido uma vez e aplicado igual).
2. **Serviço** com `HttpClient` (`listar`, `obter`, `criar`, `alterar`, `excluir` só para os endpoints que
   existem), no padrão de `receitas/crud-tabela.md`.
3. **Lista**: `receitas/crud-tabela.md` (busca, ordenação e paginação conforme a API suporta; se a API
   não pagina, pagine no cliente e avise).
4. **Formulário** de criar/alterar: `receitas/formulario.md`, com as validações do esquema (`required`,
   `minLength`, `email`, `pattern`…). Campo enum → `zur-select`/`zur-segmented`/`zur-combobox`;
   booleano → `zur-switch`/`zur-checkbox`; data → `zur-date-picker`; número → `zur-number-input`.
5. **Detalhe** quando fizer sentido (`receitas/lista-detalhe.md` ou rota `:id`).
6. Rotas, `ng build`, e mostre o resultado antes de passar ao próximo recurso.

## Cuidados
- Não altere o backend sem pedir.
- Erros de API viram mensagens claras (`ZurToastService` ou `zur-alert`), nunca silêncio.
- Nada de dados falsos misturados com a API real; se precisar de dados de exemplo, deixe isso explícito.

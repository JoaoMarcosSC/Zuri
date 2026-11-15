# Layouts do Zuri — guia de decisão

Os layouts são *shells* de página da biblioteca (`projects/zuri/src/lib/layout`). Cada um cuida
de estrutura, largura, responsividade e tema; você só coloca o conteúdo. A página **Layouts**
da docs mostra cada um rodando (desktop, tablet e mobile), e o Storybook tem uma story por
layout (`Layouts/*`).

## Como escolher

Responda três perguntas, na ordem:

1. **Que tipo de app/página é?** (público ou logado)
2. **Que conteúdo predomina?** (texto, dados, tarefa única, lista de itens)
3. **Quem usa, e com que frequência?** (visitante ocasional ou usuário diário)

| Tipo de app | Conteúdo predominante | Público / frequência | Layout | Componente |
|---|---|---|---|---|
| Site público, produto, campanha | Seções longas, narrativa | Visitante, uma vez | Landing | `zur-landing-layout` |
| Área logada, painel, back-office | Cartões, tabelas, gráficos | Usuário diário, várias seções | Dashboard | `zur-dashboard-layout` |
| Caixa de entrada, pedidos, tickets | Coleção de itens + detalhe | Usuário diário, escaneia e abre | Lista e detalhe | `zur-list-detail-layout` |
| Cadastro, checkout, configuração | Campos e etapas | Tarefa única, concluir | Formulário e wizard | `zur-form-layout` |
| Guias, manuais, base de conhecimento | Texto corrido + navegação | Consulta e leitura | Documentação | `zur-docs-layout` |
| Login, cadastro, recuperar senha | Poucos campos | Tarefa única, sem distração | Autenticação | `zur-auth-layout` |
| Página inexistente, sem acesso, erro 5xx | Mensagem + saída | Qualquer um, momento de frustração | Erro e 404 | `zur-error-layout` |

Em dúvida entre dois, use o desempate: **o usuário volta todo dia?** → layout com sidebar
(Dashboard/Documentação). **É uma tarefa para terminar?** → Formulário ou Autenticação.
**É para convencer?** → Landing.

## Comportamento padrão

| Layout | Sidebar | Topbar | Largura (`width`) | Extras |
|---|---|---|---|---|
| Landing | — | sticky, some ao rolar | `wide` ~1100px | `zur-footer` |
| Dashboard | recolhível, gaveta no mobile | sticky, some ao rolar | `fluid` | `zur-page-header`, `zur-breadcrumb` |
| Lista e detalhe | — (lista de 360px) | sticky, some ao rolar | `fluid` | no mobile, um painel por vez |
| Formulário e wizard | — | opcional | `reading` ~760px | etapas (`steps` + `current`), barra de ações fixa |
| Documentação | recolhível, gaveta no mobile | sticky, some ao rolar | `reading` ~760px | `zur-page-header`, `zur-footer` |
| Autenticação | — | — | `narrow` ~440px | marca acima, links abaixo |
| Erro e 404 | — | — | `narrow` ~440px | ações como conteúdo |

- **Largura** — todo layout com container aceita `width="fluid | wide | reading | narrow"`.
- **Sidebar** — fixa no desktop e recolhível pelo usuário (botão de menu no topbar). No tablet
  (768–1023px) já começa recolhida, só com ícones. No mobile (<768px) vira gaveta com fundo
  escurecido; ESC e toque no fundo fecham. Itens do `zur-sidenav` com ícone
  (`<svg zurSidenavIcon>`) continuam úteis recolhidos; itens secundários somem.
- **Topbar** — `hideOnScroll` (padrão `true`): some ao rolar para baixo e volta ao rolar para
  cima. Use `[hideOnScroll]="false"` para fixá-la sempre.
- **Breakpoints** — mobile < 768 · tablet 768–1023 · desktop ≥ 1024.
- **Tema** — só usa tokens (`--zur-*`); funciona em claro e escuro sem ajuste.

## Peças (subcomponentes)

| Componente | Para quê | Slots |
|---|---|---|
| `zur-sidebar` | Navegação lateral do layout | `[zurSidebarHeader]`, conteúdo, `[zurSidebarFooter]` |
| `zur-sidenav` + `zur-sidenav-item` + `zur-sidenav-label` | Links da sidebar | `[zurSidenavIcon]` no item |
| `zur-topbar` | Barra superior | `[zurTopbarStart]`, `[zurTopbarLinks]`, `[zurTopbarActions]` |
| `zur-page-header` | Título, descrição, ações e breadcrumb da página | `zur-breadcrumb`, `[zurPageHeaderActions]` |
| `zur-breadcrumb` | Trilha de navegação | — |
| `zur-footer` | Rodapé | conteúdo, `[zurFooterLinks]` |

Breadcrumb, page-header e rodapé são **sempre opcionais**: cada layout os aceita por slot, mas
nenhum é obrigatório.

## Esqueletos

Dashboard:

```html
<zur-dashboard-layout>
  <zur-sidebar>
    <zur-logo zurSidebarHeader variant="auto" />
    <zur-sidenav aria-label="Principal">
      <a zur-sidenav-item routerLink="/" routerLinkActive="active">
        <svg zurSidenavIcon>…</svg>Início
      </a>
    </zur-sidenav>
  </zur-sidebar>

  <zur-topbar>
    <ng-container zurTopbarActions><zur-theme-toggle /></ng-container>
  </zur-topbar>

  <zur-page-header title="Visão geral">
    <zur-breadcrumb [items]="trilha" />
    <button zurPageHeaderActions zur-button>Novo pedido</button>
  </zur-page-header>
  <!-- conteúdo -->
</zur-dashboard-layout>
```

Os demais esqueletos estão na página **Layouts** da docs, com o código de cada um.

## Regras

- Use um único layout por página (o shell fica na rota, não dentro de outro shell).
- Itens do `zur-sidenav` ganham destaque verde com `routerLinkActive="active"` ou `[active]`.
- `zur-sidebar` e `zur-topbar` só se coordenam quando estão dentro de um layout com sidebar
  (Dashboard ou Documentação); fora dele, o topbar não mostra o botão de menu.
- O atalho `/zuri-layout` recomenda o layout e gera o esqueleto.

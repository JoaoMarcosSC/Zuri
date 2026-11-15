<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="branding/zuri-horizontal-dark.svg">
  <img src="branding/zuri-horizontal-light.svg" alt="Zuri" height="96">
</picture>

### Um design system amigável

![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
[![npm](https://img.shields.io/npm/v/@juau/zuri?color=23ad7b&label=npm)](https://www.npmjs.com/package/@juau/zuri)
![License](https://img.shields.io/badge/licença-MIT-lightgrey)

</div>

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="branding/screenshots/home-dark.png">
  <img src="branding/screenshots/home-light.png" alt="Página inicial da documentação do Zuri" width="100%">
</picture>

Zuri é uma biblioteca de componentes e layouts para Angular. Tem uma cor de ação (um verde-menta), a fonte Nunito Sans, cantos de 8 a 14px e um único nível de sombra, usado só em elementos flutuantes. O tema escuro não é o claro invertido: tem fundo grafite com um toque de verde e degraus de elevação próprios.

Os componentes são standalone e usam `OnPush`. Os campos de formulário (`zur-input`, `zur-select`, `zur-checkbox`, `zur-radio`, `zur-switch`) implementam `ControlValueAccessor`, então funcionam com `ngModel` e formulários reativos.

O tema vem de CSS variables. O `zur-theme-toggle` alterna entre claro e escuro, guarda a escolha no `localStorage` e, na primeira visita, segue o `prefers-color-scheme` do sistema. Para trocar o tema só de um trecho da página, a diretiva `zurThemeScope` faz isso sem afetar o resto.

A documentação deste repositório foi feita com o próprio Zuri, então cada componente aparece funcionando, com o código ao lado.

## Veja em ação

A documentação com demos ao vivo está em **https://joaomarcossc.github.io/Zuri/** e o catálogo de componentes (Storybook) em **https://joaomarcossc.github.io/Zuri/storybook/**.

<table>
  <tr>
    <td width="50%"><img src="branding/screenshots/layout-dashboard-light.png" alt="Layout Dashboard, tema claro"><br><sub>Dashboard, tema claro. A sidebar recolhe e o topbar some ao rolar.</sub></td>
    <td width="50%"><img src="branding/screenshots/layout-dashboard-dark.png" alt="Layout Dashboard, tema escuro"><br><sub>O mesmo Dashboard no tema escuro.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="branding/screenshots/componentes-dark.png" alt="Página de componentes, tema escuro"><br><sub>Página de componentes: demo ao vivo e código.</sub></td>
    <td width="50%" align="center"><img src="branding/screenshots/layout-formulario-light.png" alt="Layout Formulário no mobile" width="220"><br><sub>Formulário no mobile.</sub></td>
  </tr>
</table>

## Começando

Instale o pacote:

```bash
npm install @juau/zuri
```

Importe os tokens e a fonte no `styles.css` global da aplicação:

```css
/* styles.css global da aplicação */
@import '@juau/zuri/styles/tokens.css';
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800&display=swap');

body {
  margin: 0;
  background: var(--zur-canvas);
  color: var(--zur-body);
  font: var(--zur-font-body);
}
```

```ts
import { ZurButton, ZurBadge, ZurLogo } from '@juau/zuri';
```

```html
<zur-logo />
<zur-badge color="mint">Novo</zur-badge>
<button zur-button variant="primary" size="lg">Reservar agora</button>
```

## Rodando este repositório

Para ver a documentação e o Storybook localmente, ou para mexer na biblioteca:

```bash
git clone https://github.com/JoaoMarcosSC/Zuri.git
cd Zuri
npm install

npm start                 # documentação em http://localhost:4200
npm run storybook         # catálogo de componentes
npx ng build zuri         # compila a biblioteca para dist/zuri
```

## Componentes

| Grupo | Componentes |
|---|---|
| Tema e marca | `ZurThemeService`, `zur-theme-toggle`, `[zurThemeScope]`, `zur-logo` |
| Fundamentos | `button[zur-button]`, `zur-badge`, `zur-card`, `zur-avatar` |
| Formulários | `zur-input`, `zur-select`, `zur-checkbox`, `zur-radio`, `zur-switch` |
| Navegação | `zur-navbar`, `zur-tabs`, `zur-menu`, `zur-breadcrumb`, `zur-sidenav` |
| Conteúdo | `zur-step` |
| Feedback | `zur-modal`, `ZurToastService`, `[zurTooltip]`, `zur-alert`, `zur-spinner`, `zur-skeleton` |

## Layouts de página

Cada layout resolve a estrutura da página, a largura do conteúdo, o comportamento no celular e o tema. Você só coloca o conteúdo dentro.

| Layout | Componente | Sidebar | Largura |
|---|---|---|---|
| Landing | `zur-landing-layout` | não | `wide`, ~1100px |
| Dashboard | `zur-dashboard-layout` | recolhível | `fluid` |
| Lista e detalhe | `zur-list-detail-layout` | não | `fluid` |
| Formulário e wizard | `zur-form-layout` | não | `reading`, ~760px |
| Documentação | `zur-docs-layout` | recolhível | `reading`, ~760px |
| Autenticação | `zur-auth-layout` | não | `narrow`, ~440px |
| Erro e 404 | `zur-error-layout` | não | `narrow`, ~440px |

Breadcrumb, cabeçalho de página e rodapé são opcionais: `zur-breadcrumb`, `zur-page-header` e `zur-footer`, junto com `zur-sidebar` e `zur-topbar`, entram por slot.

```html
<zur-dashboard-layout>
  <zur-sidebar>
    <zur-logo zurSidebarHeader variant="auto" />
    <zur-sidenav aria-label="Principal">
      <a zur-sidenav-item routerLink="/" routerLinkActive="active">Início</a>
    </zur-sidenav>
  </zur-sidebar>

  <zur-topbar>
    <ng-container zurTopbarActions><zur-theme-toggle /></ng-container>
  </zur-topbar>

  <zur-page-header title="Visão geral" />
</zur-dashboard-layout>
```

Se você não sabe qual layout usar, o [guia de decisão](LAYOUTS.md) cruza tipo de app, conteúdo e público. No Claude Code, o comando `/zuri-layout` faz essas perguntas, recomenda um layout e gera o esqueleto da página.

## Design

A especificação completa (cores, tipografia, espaçamento, elevação, componentes e layouts) está em [DESIGN.md](DESIGN.md). O guia de layouts é o [LAYOUTS.md](LAYOUTS.md). A pasta [branding](branding) tem o logo em SVG (horizontal e ícone, para fundo claro, escuro e com cores do tema) e o favicon.

## Estrutura

```text
.
├── projects/
│   ├── zuri/              biblioteca (ng-packagr) e Storybook
│   │   ├── src/lib/       componentes e layouts
│   │   ├── src/styles/    tokens.css, com os temas claro e escuro
│   │   └── src/stories/   stories do Storybook
│   └── docs/              documentação, feita com o próprio Zuri
├── branding/              logo, favicon e screenshots
├── .claude/commands/      comando /zuri-layout
├── DESIGN.md
└── LAYOUTS.md
```

A documentação lê a biblioteca de `dist/zuri`. Depois de mexer na biblioteca, rode `npx ng build zuri` ou deixe `npm run watch` aberto.

## Scripts

| Comando | O que faz |
|---|---|
| `npm start` | Sobe a documentação em modo de desenvolvimento |
| `npx ng build zuri` | Compila a biblioteca para `dist/zuri` |
| `npx ng build docs` | Compila a documentação para `dist/docs` |
| `npm run storybook` | Abre o Storybook |
| `npm run build-storybook` | Gera o Storybook estático |
| `npm run watch` | Recompila a biblioteca ao salvar |

## Nome e logo

Zuri quer dizer "bonito" em suaíli. No logo, o Z com a folha na ponta é a primeira letra do nome, e o resto é só "uri". As cores vêm dos tokens, então o logo muda junto com o tema.

## Licença

[MIT](LICENSE).

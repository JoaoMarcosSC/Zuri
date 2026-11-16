# Regras do Zuri

Siga estas regras em todo código de interface. Elas valem mais do que o seu gosto pessoal ou o
padrão de outra biblioteca: o Zuri tem identidade própria.

## Componentes
- **Use os componentes do Zuri antes de criar os seus.** Antes de escrever um botão, campo, tabela,
  modal ou lista, procure no `catalogo.md`. Só crie componente próprio para o que não existe, e
  monte-o com os componentes e tokens do Zuri.
- **Só a API real.** Use seletores, entradas e saídas que estão no `catalogo.md`. Não invente inputs.
- Importe de `'@juau/zuri'` e coloque cada componente em `imports: [...]` do componente standalone.
  O erro `NG8001` ("is not a known element") quase sempre é import faltando.
- Botões e links são **atributos em elementos nativos**: `<button zur-button>`, `<a zur-link>`,
  `<button zur-icon-button label="…">`. Não use `<zur-button>`.

## Código Angular
- Componentes standalone, `changeDetection: ChangeDetectionStrategy.OnPush`, estado em `signal()`.
- Formulários: prefira **Signal Forms** (`form()` + `[formField]` de `@angular/forms/signals`); `ngModel`
  e formulários reativos também funcionam em todos os controles do Zuri.
- Textos internos dos componentes vêm do `ZUR_I18N` (português padrão; `provideZuriI18n('en')`). Os
  textos da sua tela (títulos, rótulos) são seus: escreva-os no idioma do produto.
- Ícones: `zur-icon` com as constantes `zurIcon…` (lista no fim do `catalogo.md`). Não use emoji nem
  outra biblioteca de ícones.

## Visual
- **Só tokens `--zur-*`** no CSS: cores, espaços, raios, sombras, fontes. Nunca cores fixas (`#fff`,
  `rgb()`, `black`) nem sombras próprias: elas quebram o tema escuro.
- **Menta (`--zur-primary`) só para ação ou estado ativo**: botão principal, item ativo, foco. Um ou dois
  momentos de menta por tela. Seleção usa `surface-soft`/`surface-strong` + borda de ink, não menta.
- Texto sobre menta é escuro (`--zur-on-primary`), nunca branco.
- **Raios:** 8 px em controles (`--zur-radius-sm`), 14 px em cards (`--zur-radius-md`), pílula
  (`--zur-radius-full`). Não invente outros.
- **Uma única sombra** (`--zur-shadow-float`) e só em elementos flutuantes (menu, modal, toast, FAB).
  Cards ficam planos com hairline (`--zur-hairline`).
- Espaçamento generoso: escala `--zur-space-xs…section`; 96 px ou mais entre seções de página.
- Tipografia pelos tokens `--zur-font-*` (Nunito Sans, pesos 400–800).
- Cores semânticas (`success`, `warning`, `error`, `info`) só para feedback, com os pares
  `*-soft` (fundo) e `*-text` (texto) — já com contraste AA.

## Tema
- O modo de tema do projeto está no `AGENTS.md` (claro, escuro ou ambos). Respeite-o: em "só claro" ou
  "só escuro" não coloque `zur-theme-toggle`.
- Teste sempre nos dois temas quando o modo for "ambos".

## Acessibilidade (obrigatório)
- Todo controle tem rótulo visível ou `label`; botão só de ícone usa `zur-icon-button` com `label`.
- Não dependa só de cor: estados levam ícone ou texto.
- Teclado: tudo que se clica funciona com Tab, Enter e Espaço; os componentes do Zuri já fazem isso,
  não os envolva em `div (click)`.
- Imagens com `alt`; ícones decorativos sem `label`.
- Mensagens de status usam os componentes de feedback (`zur-alert`, `ZurToastService`, `zur-banner`).

## Layout e responsivo
- Página nova começa por um layout `zur-*-layout` (veja `layouts.md`).
- Escreva CSS com propriedades lógicas (`margin-inline-start`, `inset-inline-end`, `text-align: start`)
  para funcionar em RTL.
- Celular: `zur-bottom-nav` para 3 a 5 destinos principais; `zur-drawer side="bottom"` para ações
  contextuais.

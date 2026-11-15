# Zuri — identidade visual

Logo escolhido: **Z com broto** (símbolo livre, estilo orgânico, paleta atual).

| Arquivo | Uso |
|---|---|
| `zuri-horizontal.svg` | Símbolo + texto; **segue o tema** (CSS variables `--zur-primary`, `--zur-primary-active`, `--zur-ink`). Use inline no HTML. |
| `zuri-symbol.svg` | Só o ícone; segue o tema. |
| `zuri-horizontal-light.svg` / `-dark.svg` | Cores fixas para fundo claro / escuro (`<img>`, README, redes sociais). |
| `zuri-symbol-light.svg` / `-dark.svg` | Ícone com cores fixas. |
| `favicon.svg` | Favicon, acompanha `prefers-color-scheme`. Cópia em `projects/docs/public/`. |
| `proposals/` | Propostas A, B e C geradas na definição (histórico). |
| `preview.html` | Comparativo das propostas em 16/32/128px, claro e escuro. |

No Angular, use o componente `<zur-logo />` (`variant="horizontal | symbol | auto"`, `[size]`).

Tamanho mínimo: símbolo 16px; horizontal 24px de altura.

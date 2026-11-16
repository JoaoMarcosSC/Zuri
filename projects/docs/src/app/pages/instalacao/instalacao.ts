import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ZurStep } from '@juau/zuri';
import { CodeBlock } from '../../shared/code-block/code-block';

@Component({
  selector: 'docs-instalacao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlock, ZurStep, RouterLink],
  templateUrl: './instalacao.html',
  styleUrl: './instalacao.css',
})
export class Instalacao {
  protected readonly stepInstall = `ng add @juau/zuri

# sem perguntas:
ng add @juau/zuri --theme=both --ai      # claro e escuro, com o modo com IA
ng add @juau/zuri --theme=light          # só claro, sem IA

# ou só instalar e configurar à mão:
npm install @juau/zuri
# styles.css:  @import '@juau/zuri/styles/tokens.css';`;

  protected readonly stepTheme = `// app.config.ts (o ng add já faz isto)
import { provideZuriTheme } from '@juau/zuri';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZuriTheme({ mode: 'system' }), // claro e escuro, segue o sistema
    // provideZuriTheme({ mode: 'light' }) // só claro
    // provideZuriTheme({ mode: 'dark' })  // só escuro
  ],
};`;

  protected readonly stepShell = `<zur-navbar>
  <strong zurNavbarLogo>Casa Verde</strong>
  <ng-container zurNavbarLinks>
    <a href="#">Início</a>
    <a href="#">Plantas</a>
  </ng-container>
  <ng-container zurNavbarActions>
    <zur-theme-toggle />
  </ng-container>
</zur-navbar>

<zur-toast-container />`;

  protected readonly stepUse = `import { ZurButton } from '@juau/zuri';

@Component({
  imports: [ZurButton],
  template: \`<button zur-button variant="primary">Comprar</button>\`,
})
export class MinhaTela {}`;

  protected readonly stepAiFiles = `.claude/skills/zuri-*/SKILL.md     ← Claude Code
.claude/agents/zuri-*.md
.agents/skills/zuri-*/SKILL.md     ← Codex
.codex/agents/zuri-*.toml
AGENTS.md                          ← regras do Zuri (Codex, Cursor, Copilot…)
CLAUDE.md                          ← importa o AGENTS.md (@AGENTS.md)`;

  protected readonly stepI18n = `import { provideZuriI18n } from '@juau/zuri';

bootstrapApplication(App, {
  providers: [
    provideZuriI18n('en'), // inglês
    // ou só algumas chaves, mantendo o resto em português:
    // provideZuriI18n({ close: 'Fechar janela' }),
  ],
});`;
}

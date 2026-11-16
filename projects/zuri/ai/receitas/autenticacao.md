# Receita: tela de login

**Quando usar:** entrar, cadastrar, recuperar senha. Uma tarefa só, sem navegação em volta.
**Layout:** `zur-auth-layout` (card centralizado). **Formulário:** Signal Forms com validação.

```ts
// arquivo: src/app/auth/login.page.ts
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormField, email, form, required, submit } from '@angular/forms/signals';
import { ZurAlert, ZurAuthLayout, ZurButton, ZurInput, ZurLink, ZurLogo } from '@juau/zuri';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, RouterLink, ZurAuthLayout, ZurLogo, ZurInput, ZurButton, ZurAlert, ZurLink],
  template: `
    <zur-auth-layout>
      <span zurAuthBrand><zur-logo [size]="36" /></span>
      <h1 class="title">Entrar</h1>
      @if (falha()) {
        <zur-alert kind="error">E-mail ou senha incorretos.</zur-alert>
      }
      <form class="stack" (submit)="entrar($event)" novalidate>
        <zur-input
          label="E-mail"
          type="email"
          [formField]="f.email"
          [error]="f.email().touched() && f.email().invalid() ? (f.email().errors()[0]?.message ?? '') : ''"
        />
        <zur-input
          label="Senha"
          type="password"
          [formField]="f.senha"
          [error]="f.senha().touched() && f.senha().invalid() ? (f.senha().errors()[0]?.message ?? '') : ''"
        />
        <button zur-button variant="primary" type="submit" [disabled]="f().submitting()">Entrar</button>
      </form>
      <span zurAuthFooter>Não tem conta? <a zur-link routerLink="/cadastro">Criar conta</a></span>
    </zur-auth-layout>
  `,
  styles: `
    .title { margin: 0 0 var(--zur-space-lg); font: var(--zur-font-headline); color: var(--zur-ink); }
    .stack { display: grid; gap: var(--zur-space-md); }
  `,
})
export class LoginPage {
  private readonly router = inject(Router);

  protected readonly falha = signal(false);
  protected readonly dados = signal({ email: '', senha: '' });
  protected readonly f = form(this.dados, (p) => {
    required(p.email, { message: 'Informe o e-mail.' });
    email(p.email, { message: 'E-mail inválido.' });
    required(p.senha, { message: 'Informe a senha.' });
  });

  protected async entrar(event: Event): Promise<void> {
    event.preventDefault();
    this.falha.set(false);
    // submit marca os campos como tocados (mostra os erros) e só chama a ação se o formulário for válido
    await submit(this.f, async () => {
      const ok = await this.autenticar(this.dados().email, this.dados().senha);
      if (ok) await this.router.navigateByUrl('/');
      else this.falha.set(true);
      return undefined;
    });
  }

  /** Troque pela chamada real à sua API (serviço com HttpClient). */
  private async autenticar(email: string, senha: string): Promise<boolean> {
    return email.length > 0 && senha.length > 0;
  }
}
```

**Notas**
- Mensagens de erro vêm das regras do formulário (`message`), e só aparecem depois que o campo foi tocado.
- Erro de autenticação usa `zur-alert kind="error"` (anunciado como `role="alert"`).
- Para cadastro, acrescente campos e um `zur-checkbox` de termos; recuperação de senha é só o e-mail.

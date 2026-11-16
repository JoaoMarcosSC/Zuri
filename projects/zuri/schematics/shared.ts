import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';

export type ZuriThemeChoice = 'light' | 'dark' | 'both';

export interface ResolvedProject {
  name: string;
  root: string;
  buildOptions: Record<string, unknown>;
}

/** Aplicação alvo: a indicada em --project ou a primeira aplicação do workspace. */
export async function resolveProject(tree: Tree, projectOption?: string): Promise<ResolvedProject> {
  const workspace = await getWorkspace(tree);
  const name =
    projectOption ??
    Array.from(workspace.projects.keys()).find(
      (n) => workspace.projects.get(n)?.extensions['projectType'] === 'application',
    );
  const project = name ? workspace.projects.get(name) : undefined;
  if (!name || !project) {
    throw new SchematicsException('Nenhuma aplicação encontrada. Use --project <nome>.');
  }
  return {
    name,
    root: project.sourceRoot ?? `${project.root ? project.root + '/' : ''}src`,
    buildOptions: (project.targets.get('build')?.options ?? {}) as Record<string, unknown>,
  };
}

/** Arquivos onde a configuração da aplicação costuma ficar. */
export function appConfigFiles(root: string): string[] {
  return [`${root}/app/app.config.ts`, `${root}/main.ts`, `${root}/app.config.ts`];
}

/** Tema já configurado no projeto (`provideZuriTheme`), ou `null` se não houver. */
export function detectTheme(tree: Tree, root: string): ZuriThemeChoice | null {
  for (const file of appConfigFiles(root)) {
    if (!tree.exists(file)) continue;
    const text = tree.readText(file);
    if (!text.includes('provideZuriTheme')) continue;
    const mode = text.match(/provideZuriTheme\(\s*\{\s*mode:\s*['"](system|light|dark)['"]/)?.[1];
    return mode === 'light' || mode === 'dark' ? mode : 'both';
  }
  return null;
}

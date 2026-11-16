---
name: zuri-migrar
description: Aplica o Zuri num frontend Angular que já existe - inventaria as telas, troca HTML próprio, Angular Material, Bootstrap ou PrimeNG pelos componentes e tokens do Zuri, uma tela por vez, sem quebrar o comportamento. Use quando a pessoa já tem frontend e quer adotar o Zuri ou padronizar a interface.
---

# Migrar um frontend existente para o Zuri

## 1. Inventário
Se o agent **zuri-inventario** existir, delegue a ele o levantamento; senão, faça você:
- telas e rotas; para cada tela, os elementos de interface usados (botões, campos, tabelas, modais…);
- bibliotecas de UI e de estilo (Material, Bootstrap, PrimeNG, Tailwind, CSS próprio);
- cores, sombras e fontes fixas no CSS;
- testes que cobrem as telas.

Leia `node_modules/@juau/zuri/ai/migracao.md` (tabela de equivalências e ordem segura) e `regras.md`.

## 2. Plano
Mostre o plano e confirme:
- ordem das telas (comece pela mais simples e pelo shell de navegação);
- equivalência de cada elemento → componente do Zuri;
- o que não tem equivalente direto (fica como está ou vira componente próprio montado com o Zuri);
- o que muda visualmente (a pessoa precisa saber antes).

## 3. Uma tela por vez
1. Troque os elementos pela equivalência, **preservando** bindings, validações, rotas, `data-testid` e
   textos. Ajuste os imports do componente.
2. Troque cores, sombras e raios fixos por tokens `--zur-*`.
3. Rode `ng build` e os testes. Se um teste depende de seletor da biblioteca antiga, ajuste o teste
   mantendo o que ele verifica.
4. Mostre o que mudou e peça confirmação antes da próxima tela.

## 4. Fim
- Remova a biblioteca antiga só quando nenhum arquivo a importar (confirme com busca).
- Se o agent **zuri-revisor** existir, peça a revisão final.

## Nunca
- Migrar várias telas de uma vez sem confirmação.
- Mudar regra de negócio ou comportamento junto com o visual.
- Apagar estilos globais que outras telas ainda usam.

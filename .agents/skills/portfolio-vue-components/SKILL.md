---
name: portfolio-vue-components
description: Use when creating, extracting or refactoring Vue components, composables, scoped SCSS or interactive behavior in this portfolio.
---

# Componentes e composables do portfólio

Leia o `AGENTS.md` da raiz e o da área alterada. Execute os comandos a partir da raiz do repositório.

## Fronteiras

| Responsabilidade | Local |
| --- | --- |
| Composição das seções | `src/App.vue` |
| Conteúdo localizado e resolução de referências | `src/data/` |
| Estado de seleção e filtro de skills | `src/components/skills/useSkillsShowcase.ts` |
| Teclado, foco e scroll do modal | `src/composables/useModalDialog.ts` |
| Apresentação de mídia, stack e código | `SkillsHighlightMedia.vue`, `SkillsTechnologyList.vue`, `SkillsCodeSnippet.vue` em `src/components/skills/` |

## Extração incremental

1. Identifique as props, eventos, elementos DOM, estilos e efeitos do trecho atual. Compare o comportamento antes/depois; preserve contratos públicos e caminhos existentes quando suficientes.
2. Deixe a seção coordenar dados e estado; filhos recebem view models tipados. Um composable local recebe refs/getters do chamador, sem importar conteúdo global ou estado de outra instância.
3. Mova SCSS e regras mobile/reduced motion junto com o markup. O `scoped` do pai alcança a raiz do filho, mas não seus elementos internos. Verifique também seletores que dependem de hover do ancestral: `.skills-card:hover .skills-card__image` precisa continuar selecionando a imagem após compilar.
4. Preserve variantes explícitas `card`/`dialog`: dimensões, lazy loading, fluxo horizontal/vertical e estilos das tags diferem. Use `@use '@/assets/spotlight' as *` para o mixin; variáveis SCSS já são injetadas por `vite.config.ts`.
5. Mantenha no card a interrupção de propagação dos cliques nas tecnologias e links. Alterar a semântica das tags ou o carrossel exige um pedido próprio.
6. Efeitos DOM precisam limpar listeners, frames, timers e observers no ciclo de vida. No modal, preserve foco inicial, Escape, ciclo de Tab, devolução do foco e valores anteriores dos estilos de scroll ao fechar e desmontar.

## Verificação

Execute `npm test`, `npm run type-check` e `npm run lint:check`. Para extrações visuais, compare desktop e mobile, hover/foco, os dois idiomas, mídia `cover`/`contain`/`concept` e reduced motion no navegador disponível. Testes de estado e build não comprovam CSS nem teclado.

Erros recorrentes: deixar CSS interno no pai; aplicar `:global()` ao seletor inteiro e perder o descendente; limpar estilos de scroll com string vazia em vez de restaurar os valores; transformar componentes de apresentação em novos consumidores de JSON.

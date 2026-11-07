---
name: portfolio-verification
description: Use when validating or reviewing changes in this portfolio, selecting build and test commands, investigating regressions or preparing a completion report.
---

# Verificação do portfólio

Execute na raiz do repositório, após ler o `AGENTS.md` da raiz. Confirme o estado inicial com `git status --short` e preserve mudanças de outras tarefas.

## Escolha os checks pelo efeito

| Alteração | Evidência necessária |
| --- | --- |
| Documentação/skills | Frontmatter YAML válido, links locais existentes, comandos reais e aplicação a uma tarefa representativa |
| Lógica TypeScript/composables | `npm test`, `npm run type-check`, `npm run lint:check` |
| YAML/contratos de conteúdo | `npm run build:data`, revisão dos JSONs e referências/idiomas, `npm run build` |
| Componentes/estilos/interações | Checks de código + build + comparação desktop/mobile no navegador |

Antes de concluir uma alteração de código, rode `npm test`, `npm run lint:check` e `npm run build`. O build já executa type-check; rodá-lo isoladamente é útil durante a implementação.

## Efeitos colaterais e limites

- `npm run lint:check` usa Oxlint e ESLint sem `--fix` e sem cache ESLint. Para arquivos específicos: `npx --no-install oxlint <arquivos>` e `npx --no-install eslint <arquivos> --no-cache`.
- `npm run lint` **corrige arquivos**; `npm run format` reescreve `src/`. Não use esses comandos para uma revisão somente leitura.
- `npm run build` e `npm run dev` regeneram dados em hooks; `build:data` escreve todos os módulos e consolidados. `type-check` escreve cache em `node_modules/.tmp/`; build escreve `dist/`. Para zero escrita estrita, limite-se aos linters acima e leitura de arquivos, informando checks não executados.
- `npm test` usa Node nativo, cobre estado/filtros, atualização de locale e tokenização de snippets. Não monta SFCs, não testa CSS, foco, imagens ou navegador. Tipos dos testes também são verificados por `tsconfig.tests.json`.
- Não há dependência de testes de browser no projeto. Use o navegador disponível no ambiente; se indisponível, informe os cenários pendentes, sem afirmar validação visual.

## Cenários da seção de competências

Compare estados equivalentes antes/depois, nos dois idiomas:

- Filtros, troca de skill, categoria vazia e recuperação; highlight inicial, múltiplos highlights e seleção específica aberta em detalhes.
- Mídia conceitual, captura `cover` e badge `contain`; dimensões, hover da imagem, tags e estilos extraídos no desktop e abaixo de 640px.
- Clique em tecnologia não abre o modal; links externos continuam independentes. Abra pelo botão, feche por Escape/overlay/botão; Tab e Shift+Tab ficam no dialog.
- Foco volta ao acionador; scroll e padding anteriores são restaurados ao fechar/desmontar. Modal inicialmente fechado não deve limpar estilos de outra área. Considere fechamento rápido antes do foco assíncrono.
- Troca de locale atualiza título, texto e labels, inclusive nos detalhes abertos. Verifique reduced motion, ausência de overflow horizontal e erros de console.
- Snippet renderiza o texto original: HTML/ampersands escapados, strings/comentários sem tokenização de markup já gerado.

Revise `git diff --check`, `git diff` e arquivos novos. No relato final, diga o que mudou, comandos executados/resultados, cenários de navegador realmente observados e qualquer limitação ou falha pendente. Execução de testes não autoriza commit, push ou publicação.

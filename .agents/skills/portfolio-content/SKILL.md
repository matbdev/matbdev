---
name: portfolio-content
description: Use when editing this portfolio's bilingual YAML content, skill highlights, project or experience references, image assets or generated JSON pipeline.
---

# Conteúdo bilíngue e referências

Leia o `AGENTS.md` da raiz e `metadata/AGENTS.md`. Trabalhe a partir da raiz do repositório.

## Localize a fonte

| Mudança | Fonte autoral |
| --- | --- |
| Ordem, categorias, contextos, uso, synapses e snippets de competências | `metadata/skills.yml` |
| Textos da interface de competências | `skills.ui.content` no mesmo YAML |
| Título/introdução da seção e navegação | `metadata/sections.yml` |
| Destaque de projeto e sua mídia | `metadata/projects.yml` (+ `organizations.yml` para links) |
| Destaque de experiência | `metadata/experience.yml` |
| Badge e credencial | `metadata/certifications.yml` |

1. Inspecione uma entrada equivalente e os consumidores em `src/data/skills/{rawTypes,highlightResolvers,skillsShowcase}.ts`. Preserve wrappers YAML e IDs; os componentes recebem view models, sem resolver chaves estrangeiras.
2. Preencha `content.en` e `content.pt-BR`. O fallback `pick()` seleciona um objeto inteiro, sem completar seus campos ausentes. Labels, uso e detalhes precisam estar completos nos dois idiomas.
3. Para highlights, referencie o registro existente por `kind` e `id`; em experiência, mantenha `detailId` válido em ambos os idiomas. Por exemplo:

   ```yaml
   highlights:
     - kind: experience
       id: developer
       detailId: data-pipelines
   ```

4. Confira `context`, `categories` e os IDs de `synapses`. Skills desabilitadas ou sem contexto/highlight resolvível não aparecem. Um `detailId` inexistente cai na visão geral, portanto ausência de erro não prova referência correta. Snippets ficam fora de `content` e são compartilhados pelos idiomas.
5. Imagens usadas pelo resolver ficam diretamente em `src/assets/images/`, com basename único e extensão aceita por `src/data/imageAssets.ts`. Projetos usam captura `cover`; certificações usam badge `contain`; mídia ausente cai em `concept`. **Experiências atualmente só produzem `concept`**: uma imagem nova exige mudar tipos e resolver dentro do escopo autorizado; apenas adicionar caminho ao YAML não funciona. Ao ampliar mídia, considere que a mesma experiência pode alimentar vários detalhes/competências. `SkillIcon.vue` recebe `skill.id` no card e nomes nas tecnologias; confira o mapa/fallback para novas entradas.
6. Execute `npm run build:data`. Ele escreve módulos individuais em `src/data/` e os dois consolidados `src/data/portfolio.json` e `data/portfolio.json`. Revise todas as saídas; o gerador não valida todo o schema nem todas as referências.
7. Verifique a entrada na categoria e no destaque esperados, alterne EN/PT e confira links, alt, imagem/conceito e snippet. Rode `npm test` e `npm run build` quando concluir uma alteração consumida pela aplicação.

Não edite JSON gerado nem duplique conteúdo de projetos/experiências em componentes. Campos como `targets` e `resume_bullet` não são filtros implementados pelo compilador atual; não prometa geração de currículos a partir deles.

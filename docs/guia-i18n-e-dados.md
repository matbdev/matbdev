# Dados e idiomas no portfólio Vue

Este guia descreve o que está implementado. Comandos são executados a partir da raiz do repositório.

## Fluxo dos dados

```text
metadata/*.yml
  → scripts/parseYml.ts
  → src/data/*.json → adaptadores TypeScript → componentes Vue
                    → modelo de currículo → prévia, Markdown e PDFs
  → data/portfolio.json → READMEs de perfil e conteúdo pré-renderizado
```

`npm run build:data` converte os módulos. Os hooks de `npm run dev` e `npm run build` executam a mesma geração. Após editar YAML, reinicie `npm run dev` para regenerar os dados e os PDFs servidos pelo Vite.

Os adaptadores [heroProfile.ts](../src/data/heroProfile.ts) e [skillsShowcase.ts](../src/data/skills/skillsShowcase.ts) oferecem dados prontos para a interface. Os componentes de apresentação recebem props, sem procurar registros ou decidir traduções.

## Locale compartilhado

[src/state/locale.ts](../src/state/locale.ts) já centraliza `currentLocale`, `setLocale`, `toggleLocale`, `initLocale`, as opções de idioma e a navegação localizada.

A inicialização considera, nesta ordem:

1. Parâmetro `?lang=` da URL.
2. Idioma no caminho `/en/` ou `/pt-BR/`.
3. Preferência `matbdev.locale` no localStorage.
4. Idioma português do navegador.
5. `defaultLocale` de `metadata/site.yml`, com `en` quando ausente.

`setLocale()` atualiza o estado, tenta persistir a preferência e ajustar a URL, e atualiza idioma do documento, título, descrição e metadados sociais. O seletor do header já utiliza esse estado. Não crie outro `ref` global de idioma por seção.

Textos novos devem manter as chaves reais:

```yaml
content:
  en:
    usage: Builds data pipelines.
  pt-BR:
    usage: Desenvolve pipelines de dados.
```

O helper `pick()` do adaptador de skills faz fallback de um objeto localizado inteiro para inglês. Um objeto `pt-BR` incompleto não é completado campo a campo. IDs, chaves de listas e referências permanecem estáveis durante a troca de idioma; evite usar texto traduzido como identidade quando houver ID.

## Competências e highlights

[metadata/skills.yml](../metadata/skills.yml) define categorias, contextos, itens e textos da interface. Cada item referencia projetos, experiências ou certificações por `kind`/`id`, opcionalmente `detailId` para experiência.

- [rawTypes.ts](../src/data/skills/rawTypes.ts) descreve os campos consumidos do JSON.
- [highlightResolvers.ts](../src/data/skills/highlightResolvers.ts) resolve os registros para o idioma atual.
- [types.ts](../src/data/skills/types.ts) define view models consumidos pelos componentes.
- `skillsShowcase.ts` filtra itens com `enabled: false`, resolve contextos/highlights e publica `computed`s reativos ao locale.

Uma referência inexistente pode eliminar o highlight e a própria skill da lista. Um `detailId` inválido cai na visão geral da experiência. Confira o alvo nos dois idiomas, mesmo quando o build passar.

Snippets ficam fora de `content` e são compartilhados entre idiomas. A renderização em `SkillsCodeSnippet.vue` usa `highlightCode.ts` para escapar HTML e aplicar tokens uma única vez.

## Imagens

[imageAssets.ts](../src/data/imageAssets.ts) resolve por nome de arquivo imagens diretamente em `src/assets/images/`, nas extensões do glob. Evite basenames duplicados. Caminhos escritos no YAML não precisam reproduzir a pasta física, mas o arquivo precisa estar incluído no bundle.

Projetos renderizam imagens `cover`, certificações usam `contain`; sem asset resolvido, há fallback conceitual. Experiência atualmente sempre produz mídia `concept`. Adicionar imagem a uma experiência exige estender o contrato e o resolver; apenas editar o YAML não altera esse comportamento.

## Manutenção e verificação

Para alterar conteúdo: edite o YAML de origem, preserve os dois idiomas e IDs, execute `npm run build:data`, revise as saídas e confira a interface em EN/PT. `npm test` cobre lógica de seleção/localização de detalhes e tokenização, e `npm run build` valida tipos e empacotamento. Nenhum deles comprova traduções, referências completas ou aparência.

## Currículos

Edite [`metadata/resumes.yml`](../metadata/resumes.yml) para alterar os textos e a
seleção de experiências, habilidades, projetos e premiações. Contato, formação e
credenciais vêm dos módulos correspondentes. A prévia, a exportação Markdown e os
quatro PDFs usam o mesmo modelo, com versões de Dados e Software em inglês e
português. `npm run build` grava os downloads em `dist/assets/resumes/`.

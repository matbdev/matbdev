# Seção de competências

Leia o [AGENTS.md da aplicação](../../../AGENTS.md). Esta pasta renderiza competências; as skills para agentes ficam em `.agents/skills/` na raiz da aplicação.

## Responsabilidades

| Arquivo | Contrato |
| --- | --- |
| `SkillsSection.vue` | Conecta dados localizados, estado e componentes |
| `useSkillsShowcase.ts` | Filtros, índice selecionado e highlight aberto; recebe lista reativa |
| `SkillsArcCarousel.vue`, `useArcCarousel.ts` | Geometria, navegação e interação do carrossel |
| `SkillsHighlightCard.vue` | Destaque ativo, navegação entre highlights e abertura dos detalhes |
| `SkillsHighlightDialog.vue` | Estrutura do modal e eventos close/selectHighlight |
| `SkillsHighlightMedia.vue` | Imagem/conceito e estilos próprios por variante card/dialog |
| `SkillsTechnologyList.vue` | Tags e destaque case-insensitive da tecnologia ativa |
| `SkillsCodeSnippet.vue`, `highlightCode.ts` | Terminal e tokenização segura de texto |
| `highlightLinkIcons.ts`, `SkillIcon.vue`, `skillIconNames.ts` | Ícones de links, imagens das ferramentas e aliases de nomes |

Os tipos prontos para renderizar estão em `src/data/skills/types.ts`; YAML e chaves estrangeiras são tratados em `src/data/skills/{rawTypes,highlightResolvers,skillsShowcase}.ts`. O modal usa `src/composables/useModalDialog.ts` para foco, teclado e scroll.

## Invariantes

- `all` mostra a lista inteira; um filtro considera `categories`, o campo legado `category` e evidência de certificação. Trocar categoria volta ao primeiro item; lista vazia apresenta recuperação para `all`.
- `useSkillsShowcase` deve permanecer independente por instância. Preserve reatividade quando os dados/idioma mudarem; o índice não pode gerar acesso inválido após redução da lista.
- Trocar `skill.id` reinicia o highlight do card. Abrir detalhes deve mostrar exatamente o highlight escolhido, inclusive depois da navegação entre projetos.
- Cliques nas tecnologias e nos links do card não abrem o dialog. Links externos mantêm `target="_blank"` e `rel="noopener noreferrer"`.
- Mídia mantém `cover` para captura, `contain` para badge e `concept` para diagrama autoral. Preserve a variante compacta, o hover da imagem e diferenças entre card/modal.
- Ícones das ferramentas usam WebP local em `src/assets/tool-icons/`, com proporções preservadas e canvas transparente de 64 × 64. Ao adicionar uma ferramenta, registre seus aliases em `skillIconNames.ts` e sua imagem em `SkillIcon.vue`; mantenha a fonte e os avisos de licença junto dos assets. Nomes desconhecidos ou falhas de carregamento usam o fallback genérico.
- `highlightCode` recebe texto, escapa HTML e aplica tokens uma vez. O único `v-html` desta seção consome sua saída; nunca injete snippets crus ou tokenize o HTML já produzido.
- Mantenha `role="dialog"`, `aria-modal`, título vinculado, foco inicial, Tab/Shift+Tab, Escape, fechamento no overlay e restauração de foco/estilos ao fechar ou desmontar.
- Preserve os cálculos do carrossel em uma refatoração de apresentação. Alterações de geometria ou experiência de navegação precisam estar no escopo do pedido.

Use a skill [portfolio-vue-components](../../../.agents/skills/portfolio-vue-components/SKILL.md) ao alterar componentes, e a [portfolio-content](../../../.agents/skills/portfolio-content/SKILL.md) para conteúdo. As verificações e seus limites estão em [portfolio-verification](../../../.agents/skills/portfolio-verification/SKILL.md).

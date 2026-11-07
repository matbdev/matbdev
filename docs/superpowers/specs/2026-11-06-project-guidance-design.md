# Instruções do projeto e modularização de skills

## Intenção e escopo

Criar instruções locais para gerações de código consistentes com este portfólio e executar a refatoração incremental de skills solicitada pelo usuário. Preservar aparência, conteúdo bilíngue e interações. Usar Vue 3, TypeScript, SCSS, tokens e ferramentas já instalados.

## Abordagens

- **Incremental, adotada:** manter as pastas atuais, extrair responsabilidades compartilhadas e registrar convenções e fluxos de trabalho locais. Minimiza movimentações e permite comparar o comportamento antes/depois.
- **Módulo `features/skills`:** aproximaria todos os arquivos, mas introduziria mudanças de caminhos sem necessidade para este trabalho.

## Estrutura proposta

- `AGENTS.md`: mapa do projeto, convenções, comandos e roteamento para skills locais.
- `src/components/skills/AGENTS.md`: limites e invariantes específicos da seção.
- `metadata/AGENTS.md`: autoria YAML, idiomas e referências entre registros.
- `.agents/skills/portfolio-vue-components/SKILL.md`: fluxo para extrair e criar componentes/composables, incluindo estilos scoped e limpeza de efeitos.
- `.agents/skills/portfolio-content/SKILL.md`: fluxo para conteúdo bilíngue, assets e referências de highlights.
- `.agents/skills/portfolio-verification/SKILL.md`: verificações com comandos reais, efeitos colaterais e cenários de navegação.
- `useSkillsShowcase.ts`: estado local, filtros, seleção e abertura/fechamento de detalhes; recebe skills reativas sem importar conteúdo global.
- `useModalDialog.ts`: foco, Escape, Tab, bloqueio e restauração do scroll durante o ciclo de vida do modal.
- `SkillsHighlightMedia.vue`, `SkillsTechnologyList.vue`, `SkillsCodeSnippet.vue`: apresentação e estilos próprios; variantes explícitas para card/modal quando necessário.
- `highlightLinkIcons.ts`: mapeamento único entre tipos de links e ícones.

## Restrições e decisões

Manter o carrossel e seus cálculos existentes. Não alterar schema, idiomas, identidade visual, dependências ou estrutura global de pastas. Não editar JSON gerado manualmente. Conteúdo de projeto/experiência/certificação continua no módulo de origem. Skills devem ser curtas e específicas, sem duplicar regras de todas as ferramentas ou acrescentar aprovações rotineiras.

A sessão atual permite escrita direta em `.agents/skills`; instalar e validar as skills no próprio projeto, sem alterar configurações pessoais. Não publicar, fazer push ou criar commits neste trabalho.

## Ajustes confirmados durante a execução

- Manter seleção de highlight por chave e derivar o objeto da lista reativa, para atualizar detalhes abertos ao trocar locale. Fechar detalhes quando a lista ficar vazia.
- Preservar valores e prioridades anteriores de scroll/padding ao fechar ou desmontar o modal; um modal fechado não altera estilos globais.
- Tokenizar snippets originais uma vez, escapando cada trecho antes de produzir HTML. O algoritmo anterior aplicava regex sobre spans já gerados e corrompia markup em strings. A correção pode alterar a altura das linhas de snippets afetados; o restante da aparência deve permanecer equivalente.
- Disponibilizar `npm test`, `npm run lint:check` e verificação de tipos dos testes sem adicionar dependências ao projeto.

## Verificação

Executar build e lint de referência antes das alterações. Cobrir seleção/filtros e renderização segura de snippets com testes comportamentais usando Node e Vue existentes. Validar manifests das skills e exercitar seus fluxos com revisão independente. Executar type-check, build, lint sem correção automática e revisão de diff ao final. Comparar renderização e verificar teclado, modalidades de mídia, idiomas e responsividade em browser quando disponível; declarar qualquer limitação real.

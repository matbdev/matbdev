# Orientações para o portfólio

## Escopo e contexto

A raiz deste repositório contém o portfólio ativo de Mateus Carniel Brambilla, em Vue 3 + TypeScript + Vite. Execute os comandos abaixo aqui.

Leia também o `AGENTS.md` da pasta alterada. As instruções específicas complementam este arquivo; o pedido explícito do usuário define o escopo. Preserve alterações preexistentes no working tree.

## Mapa e fontes de verdade

| Área | Responsabilidade |
| --- | --- |
| `src/App.vue`, `src/main.ts` | Composição da página e bootstrap |
| `src/components/{header,hero,skills,footer}/` | Componentes e comportamento de cada seção |
| `src/composables/` | Comportamentos compartilhados com ciclo de vida próprio |
| `src/data/seo.ts`, `scripts/prerender.ts` | Metadados, dados estruturados e geração de HTML/Markdown estáticos |
| `src/state/locale.ts` | Locale global, URL, persistência e metadados do documento |
| `metadata/*.yml` | Conteúdo autoral, referências e traduções |
| `scripts/parseYml.ts` | Conversão YAML → JSON e resolução de projetos das disciplinas |
| `scripts/profileReadme.ts` | Geração dos READMEs do perfil a partir dos mesmos metadados |
| `src/data/*.json`, `data/portfolio.json`, `dist/`, `README.md`, `README-en.md` | Saídas geradas; não editar manualmente |
| `src/data/*.ts`, `src/data/skills/` | Adaptação dos dados, assets e view models localizados |
| `src/assets/{tokens.css,_variables.scss,_spotlight.scss}` | Tokens e mixins compartilhados |
| `tests/` | Testes comportamentais com o runner nativo do Node |

## Convenções de implementação

- Use `<script setup lang="ts">`, Composition API, props e emits tipados. Preserve os contratos existentes e trate arrays/índices vazios: `noUncheckedIndexedAccess` está ativo.
- Use `@/` para imports de `src/`; em testes executados diretamente pelo Node, use caminhos relativos com extensão `.ts`. Imports de tipos devem ser `import type`.
- Componentes ficam em PascalCase; composables em `useX.ts`; identificadores de código e nomes de arquivos seguem o inglês existente. Converse e documente em português quando apropriado ao usuário.
- Estado de interface fica na seção ou composable da funcionalidade. Conteúdo e localização ficam nos adaptadores; evite leitura de YAML/JSON em componentes de apresentação.
- Preserve `en` e `pt-BR`, IDs estáveis, links e fatos profissionais. Novos textos da interface devem entrar nos módulos YAML correspondentes. Não invente experiência, métricas ou credenciais.
- Preserve a identidade visual vigente: Manrope local, superfícies escuras, detalhes em azul e spotlight âmbar contextual. Os tokens e o código ativo são a referência exata.
- Estilos locais usam `<style scoped lang="scss">` e classes existentes no padrão BEM. As variáveis de `_variables.scss` são injetadas pelo Vite; importe o mixin de spotlight onde utilizado. Mova estilos e media queries com o markup extraído.
- Preserve acessibilidade e responsividade: controles nativos, nomes acessíveis localizados, foco visível, teclado, textos alternativos e `prefers-reduced-motion`. Limpe efeitos DOM ao desmontar.
- Prefira mudanças incrementais na estrutura atual. Acrescente dependências ou novas abstrações quando o pedido justificar; confira primeiro se Vue, APIs nativas e utilitários existentes atendem.
- Siga `.editorconfig` e `.prettierrc.json`: dois espaços, aspas simples, sem ponto e vírgula, largura 100. Formate apenas arquivos alterados.

## Skills locais

Leia somente as skills pertinentes à tarefa; os caminhos são relativos a esta pasta. Elas ficam versionadas em `.agents/skills/`, sem depender de plugins pessoais.

| Tarefa | Skill |
| --- | --- |
| Criar/extrair componentes, composables, estilos e interações | [portfolio-vue-components](.agents/skills/portfolio-vue-components/SKILL.md) |
| Alterar conteúdo bilíngue, highlights, assets e referências YAML | [portfolio-content](.agents/skills/portfolio-content/SKILL.md) |
| Validar alterações, diagnosticar limites dos checks e concluir uma entrega | [portfolio-verification](.agents/skills/portfolio-verification/SKILL.md) |

`src/components/skills/` implementa a seção de competências do site; `.agents/skills/` contém instruções para agentes. São responsabilidades diferentes.

## Comandos

Use o Node indicado em `package.json` (`^22.18.0 || >=24.12.0`) e npm com `package-lock.json`. Na instalação limpa, execute `npm ci`.

| Comando | Efeito |
| --- | --- |
| `npm run dev` | Regenera dados no predev e inicia o Vite |
| `npm run build:data` | Converte os 13 módulos YAML e escreve JSONs individuais, consolidados e READMEs do perfil |
| `npm test` | Executa `tests/*.test.ts` com Node; não monta SFCs ou navegador |
| `npm run type-check` | Verifica TypeScript/Vue e escreve cache em `node_modules/.tmp/` |
| `npm run lint:check` | Oxlint e ESLint sem correção e sem cache ESLint |
| `npm run build` | Regenera dados, verifica tipos e gera `dist/` |
| `npm run preview` | Serve o build existente para inspeção |

`npm run lint` aplica correções; `npm run format` reescreve `src/`. Use `npx --no-install prettier --write <arquivos-alterados>` para formatação pontual. `build-only` gera o cliente, o bundle SSR e as páginas estáticas bilíngues; não regenera YAML nem verifica tipos.

## Fluxo de entrega

1. Leia os arquivos envolvidos e o estado do Git. Para correções, reproduza o problema; para refatorações, registre o comportamento que deve permanecer.
2. Implemente a menor mudança coerente com o pedido. Cubra lógica, regressões e efeitos relevantes com testes comportamentais; documentação e extrações triviais podem ser verificadas diretamente.
3. Rode os checks proporcionais e, para mudanças de código, `npm test`, `npm run lint:check` e `npm run build`. Mudanças de UI também exigem inspeção de desktop/mobile, idiomas, foco e teclado no navegador disponível.
4. Revise o diff, inclusive arquivos gerados. Informe o que mudou, os checks executados e limitações reais. Diferencie comportamento observado de suposições.
5. Prossiga com tarefas locais autorizadas sem aprovações repetidas. Commit, push, publicação e ações destrutivas seguem o pedido do usuário; este documento não concede autorização por si só.

Ao manter estas orientações, deixe as regras gerais aqui, invariantes da área no `AGENTS.md` correspondente e procedimentos condicionais nas skills. Atualize comandos e links quando o código mudar; evite copiar a mesma regra para vários lugares.

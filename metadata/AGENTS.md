# Conteúdo autoral

Leia o [AGENTS.md da aplicação](../AGENTS.md) e a skill [portfolio-content](../.agents/skills/portfolio-content/SKILL.md) para operações de conteúdo.

- Edite os `.yml` desta pasta. `scripts/parseYml.ts` gera `src/data/*.json`, `src/data/portfolio.json` e `data/portfolio.json`; alterações manuais nos JSONs serão sobrescritas.
- Preserve a estrutura própria de cada módulo: alguns têm objeto raiz (`skills:`, `projects:`), outros são lidos diretamente. Confira o consumidor antes de mudar um wrapper.
- Use exatamente `en` e `pt-BR` nas traduções. Preserve simetria dos campos e dos `details[].id` entre idiomas. O fallback para inglês opera sobre o objeto localizado inteiro, não campo a campo.
- IDs fazem parte do contrato: projetos, experiências, detalhes, organizações, contextos, categorias e `synapses` podem ser referenciados por outro módulo. Renomear exige revisar consumidores.
- `enabled: false` é aplicado aos itens de skills pelo adaptador. Não suponha que todas as listas já implementem esse filtro.
- Após alterar dados, execute `npm run build:data` e revise todas as saídas. O gerador resolve projetos de disciplinas, mas não faz validação completa de schema nem de chaves estrangeiras.
- Não altere fatos profissionais, datas ou métricas por inferência. Para novos textos, preserve o sentido entre idiomas e utilize os fatos fornecidos pelo usuário.

Veja o [README](README.md) para o mapa dos módulos e o [guia de dados/i18n](../docs/guia-i18n-e-dados.md) para o fluxo atual.

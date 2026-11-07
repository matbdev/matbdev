# Conteúdo modular do portfólio

Os 13 módulos YAML desta pasta são a fonte autoral do site Vue. Edite os YAMLs e gere os JSONs; não edite as saídas manualmente.

| Módulo | Conteúdo |
| --- | --- |
| [site.yml](site.yml) | Schema, data, locales e base de assets |
| [profile.yml](profile.yml) | Identidade, biografia, contato e redes |
| [sections.yml](sections.yml) | Navegação e textos das seções |
| [disciplines.yml](disciplines.yml) | Áreas de atuação e projetos destacados |
| [organizations.yml](organizations.yml) | Organizações e seus links |
| [projects.yml](projects.yml) | Projetos, tecnologias, mídia e detalhes |
| [experience.yml](experience.yml) | Experiências e detalhes profissionais |
| [skills.yml](skills.yml) | Competências, categorias, contextos, snippets e referências de highlights |
| [education.yml](education.yml) | Formação acadêmica |
| [certifications.yml](certifications.yml) | Certificações, badges e credenciais |
| [courses.yml](courses.yml) | Cursos complementares |
| [resumes.yml](resumes.yml) | Metadados e caminhos dos currículos existentes |
| [contact.yml](contact.yml) | Textos e assuntos de contato |

## Geração atual

A partir da raiz do repositório, execute:

```bash
npm run build:data
```

O comando usa [scripts/parseYml.ts](../scripts/parseYml.ts). Ele lê `.yml`/`.yaml`, resolve os projetos destacados das disciplinas e escreve:

- um JSON por módulo em `src/data/`;
- o consolidado `src/data/portfolio.json`;
- uma cópia do consolidado em `data/portfolio.json`;
- `README.md` e `README-en.md`, gerados por `scripts/profileReadme.ts` para o perfil do GitHub.

`npm run dev` e `npm run build` também geram os dados automaticamente antes de iniciar. O gerador atual não possui opção `--dry-run`, não valida todo o schema nem aplica filtros de currículo. Revise o diff dos dados gerados e verifique o conteúdo no site.

## Idiomas e referências

Use exatamente `en` e `pt-BR`. Preserve IDs e os mesmos campos em ambos os objetos localizados; o adaptador de skills usa fallback do objeto inteiro para inglês.

Em `skills.items`, `highlights` aponta para registros de outros módulos. Experiência permite selecionar um `details[].id`:

```yaml
highlights:
  - kind: experience
    id: developer
    detailId: data-pipelines
```

O registro e o detalhe devem existir nos dois idiomas. Conteúdo de projeto/experiência/certificação permanece no módulo de origem; não o copie para o componente Vue. Veja [AGENTS.md](AGENTS.md) e o [guia de dados e i18n](../docs/guia-i18n-e-dados.md).

## Limites atuais

`resumes.yml` descreve PDFs existentes; o compilador não gera currículos. Campos como `targets` ou `resume_bullet` exigem implementação própria antes de terem efeito. O adaptador também não suporta imagens em highlights de experiência: eles usam mídia conceitual. Alterações nesses contratos devem incluir tipos, resolver e validação.

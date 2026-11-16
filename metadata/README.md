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
| [resumes.yml](resumes.yml) | Versões, traduções, projetos, habilidades, premiações e URLs dos currículos |
| [contact.yml](contact.yml) | Textos e assuntos de contato |

## Geração atual

A partir da raiz do repositório, execute:

```bash
npm run build:data
```

O comando gera um JSON por módulo em `src/data/`, o export consolidado
[`data/portfolio.json`](../data/portfolio.json) e os dois READMEs do perfil.
Os comandos `npm run dev` e `npm run build` também executam essa etapa e geram os PDFs
a partir do mesmo modelo usado na prévia e na exportação Markdown.

Consulte o [guia de dados e idiomas](../docs/guia-i18n-e-dados.md) para o fluxo de
edição, referências entre módulos e validação.

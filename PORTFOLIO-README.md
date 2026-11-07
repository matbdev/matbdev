[English](PORTFOLIO-README-en.md)

# Portfólio de Mateus Carniel Brambilla

Vue 3, TypeScript e Vite. A aplicação fica na raiz do repositório.

Use Node `^22.18.0 || >=24.12.0` e npm:

```sh
npm ci
npm run dev
```

Validação e build:

```sh
npm test
npm run lint:check
npm run build
npm run preview
```

O build gera os dados YAML, verifica tipos, compila o cliente e um bundle SSR temporário em
`dist-ssr/`, e renderiza as páginas estáticas em `dist/`. Publique **somente `dist/`**.
Não é necessário executar um servidor Node em produção.

## README do perfil do GitHub

Este repositório é `matbdev/matbdev`: `README.md` apresenta o perfil em português e
`README-en.md` oferece a versão em inglês. Este arquivo contém a documentação técnica do site.

Os dois READMEs de perfil são gerados por `scripts/profileReadme.ts` durante
`npm run build:data`, `npm run dev` e `npm run build`, usando os mesmos dados YAML do portfólio.
Edite os fatos nos módulos correspondentes de `metadata/`; os títulos e links de apresentação
ficam em `profile.content.<idioma>.readme` no arquivo `metadata/profile.yml`.

Depois de editar os YAMLs, execute `npm run build:data` e inclua os READMEs atualizados no mesmo
commit. `npm test` verifica se os arquivos continuam sincronizados. O gerador não publica nem
faz commits automaticamente. Os READMEs de perfil não devem ser editados manualmente.

## SEO e leitura por agentes

- `/en/` e `/pt-BR/` têm HTML completo antes de executar JavaScript. `/` apresenta a versão padrão em inglês, com canonical para `/en/`.
- Cada idioma tem título, descrição, canonical, hreflang, Open Graph, Twitter e JSON-LD próprios.
- `robots.txt`, `sitemap.xml`, `llms.txt` e as versões Markdown são gerados no build.
- `/en/index.md` e `/pt-BR/index.md` contêm o perfil, experiência, projetos, formação, credenciais e links dos currículos a partir dos mesmos dados YAML.
- `llms.txt` é uma convenção complementar para descoberta por agentes, sem garantia de adoção ou posicionamento. O conteúdo HTML indexável continua sendo a base.
- Os links anteriores `/?lang=en` e `/?lang=pt-BR` continuam sendo interpretados pela aplicação. Novos links usam as rotas estáticas.

Edite domínio e textos de SEO em `metadata/site.yml`. O perfil e os fatos profissionais permanecem
nos módulos YAML correspondentes. Nunca edite os artefatos gerados manualmente.

## Publicação

O diretório de trabalho do provedor deve ser a raiz do repositório, o comando de build deve ser
`npm run build` e o diretório publicado deve ser `dist` (anteriormente `web/dist`). O servidor
estático deve resolver `/en/` para `/en/index.html` e `/pt-BR/` para `/pt-BR/index.html`,
preservando seus arquivos distintos. Evite uma regra que substitua todas as rotas pelo
`index.html` da raiz. Configure respostas 404 reais para URLs inexistentes.

Depois da publicação, envie `https://matbdev.com/sitemap.xml` ao Google Search Console e ao
Bing Webmaster Tools e confira as URLs localizadas. A indexação e a presença em respostas de
IA dependem de rastreamento e dos critérios de cada serviço.

Veja [AGENTS.md](AGENTS.md) e o [guia de dados e idiomas](docs/guia-i18n-e-dados.md).

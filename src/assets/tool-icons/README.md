# Tool icons

Local 64 × 64 transparent WebP images, normalized to a centered 56 × 56 maximum artwork box. The UI renders them at 13–20 CSS pixels with `object-fit: contain`.

Brand artwork comes from Devicon, Simple Icons, and the Delta Lake/Unity Catalog repositories. SQL and geospatial modeling use Lucide's database/globe symbols because they describe concepts rather than individual product brands. PySpark uses the Apache Spark mark, and JWT/OAuth2 uses the JWT mark.

Monochrome Flask, Express and Prisma artwork uses the existing light foreground color for legibility on the dark surface. Simple Icons artwork uses its brand color; the Delta Lake favicon background was removed. Shapes and aspect ratios are preserved. Source vectors were rasterized with ImageMagick at high resolution, trimmed and resized into the same canvas; Unity Catalog uses the documentation's PNG mark. No runtime CDN or icon package is required.

## Sources

| Image | Upstream artwork |
| --- | --- |
| `python.webp` | [Source](https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg) |
| `pyspark.webp` | [Source](https://raw.githubusercontent.com/devicons/devicon/master/icons/apachespark/apachespark-original.svg) |
| `flask.webp` | [Source](https://raw.githubusercontent.com/devicons/devicon/master/icons/flask/flask-original.svg) |
| `docker.webp` | [Source](https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg) |
| `typescript.webp` | [Source](https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg) |
| `nodejs.webp` | [Source](https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg) |
| `express.webp` | [Source](https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg) |
| `postgresql.webp` | [Source](https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg) |
| `prisma.webp` | [Source](https://raw.githubusercontent.com/devicons/devicon/master/icons/prisma/prisma-original.svg) |
| `jwt-oauth2.webp` | [Source](https://raw.githubusercontent.com/devicons/devicon/master/icons/jwt/jwt-original.svg) |
| `airflow.webp` | [Source](https://raw.githubusercontent.com/devicons/devicon/master/icons/apacheairflow/apacheairflow-original.svg) |
| `google-cloud.webp` | [Source](https://raw.githubusercontent.com/devicons/devicon/master/icons/googlecloud/googlecloud-original.svg) |
| `databricks.webp` | [Source](https://raw.githubusercontent.com/simple-icons/simple-icons/14.11.0/icons/databricks.svg) |
| `caddy.webp` | [Source](https://raw.githubusercontent.com/simple-icons/simple-icons/14.11.0/icons/caddy.svg) |
| `snowflake.webp` | [Source](https://raw.githubusercontent.com/simple-icons/simple-icons/14.11.0/icons/snowflake.svg) |
| `delta-lake.webp` | [Source](https://raw.githubusercontent.com/delta-io/delta/master/docs/public/favicon.svg) |
| `unity-catalog.webp` | [Source](https://raw.githubusercontent.com/unitycatalog/unitycatalog/main/docs/assets/images/uc-logo-mark-reverse.png) |
| `sql.webp` | [Source](https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/database.svg) |
| `geospatial.webp` | [Source](https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/globe.svg) |

## Licenses

Original notices are retained in `licenses/`: Devicon (MIT), Simple Icons (CC0), Lucide (ISC/MIT), Delta Lake and Unity Catalog (Apache 2.0 and notices included by upstream). Product names and logos remain the property of their respective owners.

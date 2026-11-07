# Mascote dos READMEs de perfil

O cabeçalho dos READMEs em português e inglês reutiliza o Tux de
[`src/assets/images/tux-peek.webp`](../src/assets/images/tux-peek.webp), já presente no portfólio.
A animação aplica um balanço suave ao desenho existente, com fundo transparente.

- Animação: [`public/assets/profile/tux-idle.gif`](../public/assets/profile/tux-idle.gif).
- Alternativa estática: [`public/assets/profile/tux-static.png`](../public/assets/profile/tux-static.png).
- Canvas: 120 × 144 px; exibição: 80 × 96 px.
- Ciclo: aproximadamente 4,8 segundos, a 12 quadros por segundo.

O gerador usa `<picture>`: a animação é selecionada quando
`prefers-reduced-motion: no-preference`; a imagem padrão é estática. Os caminhos e o tamanho
ficam em `profile.readmeMascot` em `metadata/profile.yml`. O texto alternativo localizado fica
em `profile.content.<idioma>.readme.mascotAlt`.

Os assets são versionados e não precisam ser recriados a cada build. Para atualizar os READMEs,
execute `npm run build:data`. Não edite os arquivos gerados manualmente.

## Recriar os assets

Com FFmpeg e ImageMagick disponíveis, execute os comandos abaixo na raiz do repositório.
Essas ferramentas são necessárias apenas para recriar a animação, não para construir o site.

```sh
ffmpeg -hide_banner -loglevel error -y \
  -i src/assets/images/tux-peek.webp \
  -vf 'scale=96:-1,format=rgba,pad=120:144:(ow-iw)/2:(oh-ih)/2:color=0x00000000' \
  -frames:v 1 public/assets/profile/tux-static.png

ffmpeg -hide_banner -loglevel error -y \
  -loop 1 -framerate 12 -t 4.8 -i src/assets/images/tux-peek.webp \
  -filter_complex "[0:v]scale=96:-1,format=rgba,pad=120:144:(ow-iw)/2:(oh-ih)/2:color=0x00000000,rotate='0.025*sin(2*PI*t/4.8)':ow=iw:oh=ih:c=none,split[a][b];[a]palettegen=max_colors=128:reserve_transparent=1:stats_mode=diff[p];[b][p]paletteuse=alpha_threshold=128:dither=sierra2_4a" \
  -loop 0 public/assets/profile/tux-idle.gif

convert public/assets/profile/tux-idle.gif -coalesce -layers Optimize \
  public/assets/profile/tux-idle-optimized.gif
mv public/assets/profile/tux-idle-optimized.gif public/assets/profile/tux-idle.gif
```

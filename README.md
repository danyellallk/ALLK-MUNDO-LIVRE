# ALLK MUNDO LIVRE — Nova versão

Este branch inicia uma reconstrução independente do jogo, mantendo o branch antigo intacto como backup.

## Objetivo
- Mundo aberto 3D inspirado no ano de 1870.
- Navegação em terceira pessoa e controles Android.
- Terreno procedural, vegetação e rochas.
- Personagem humano 3D texturizado, com esqueleto e animação carregados em GLB.
- Avatar procedural de reserva caso o modelo externo não carregue.
- Próximas etapas: povoados, casas, animais, água, inventário e salvamento.

## Tecnologia
Three.js 0.160.0 carregado por CDN. O código do jogo neste branch foi escrito para este projeto; não copia código dos repositórios de referência. O Three.js é distribuído sob licença MIT: https://github.com/mrdoob/three.js/blob/dev/LICENSE

## Execução
Abra o projeto por um servidor estático ou publique o branch no GitHub Pages. É necessário acesso à internet para carregar Three.js pela CDN.

## Personagem 3D
O protagonista usa o modelo humano `Man Base Mesh` do Grab3D, com malha anatômica, materiais PBR e versão rigged com animações de caminhada/corrida. O modelo é disponibilizado sob CC0 1.0, gratuito para uso e modificação. Fonte: https://grab3d.com/models/characters/man-base-character/ .

## Qualidade gráfica
Renderização adaptativa de alta densidade (até 2,25x a densidade de pixels do dispositivo), com sombras em 2048 px. A resolução efetiva e o desempenho dependem da tela, GPU, navegador e memória do aparelho; isso não garante saída nativa 4K em todos os celulares.

## Referências de código aberto
- O relevo procedural usa uma implementação própria de ruído fractal suave, adaptada ao sistema de altura único do jogo. A técnica foi estudada a partir do projeto [THREE.Terrain](https://github.com/IceCreamYou/THREE.Terrain), distribuído sob licença MIT. Não foi incorporado o pacote inteiro; o código do jogo foi adaptado para preservar a compatibilidade com as colisões e os objetos existentes.
- Referência visual e técnica adicional: [The Wild Between](https://github.com/anandin/the-wild-between), também MIT. Seus modelos/arquivos de natureza têm licença CC0 conforme os avisos do próprio repositório; nenhum desses arquivos foi importado nesta alteração.

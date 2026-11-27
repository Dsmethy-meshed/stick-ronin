# Estilo visual: blanco, negro y rojo (tinta japonesa)

Guía para darle a Stick Rōnin 3D un estilo propio sin cambiar de motor (seguimos en **Three.js r128**).
Escrita el 27 nov 2026. Decisión de Daniel: **mejorar el juego actual, sin rehacerlo ni migrar Three.js**.

## La idea en una frase
**Papel claro, tinta negra y rojo solo para lo importante.** Como una pintura sumi-e con sellos y sangre en bermellón.
Arcade y legible en un móvil: siluetas negras muy claras sobre fondo claro, y el rojo te dice dónde mirar.

## Reglas
1. **60 / 30 / 10.** 60 % papel (fondo, suelo, cielo), 30 % tinta (enemigos, edificios, sombras, contornos), 10 % rojo.
2. **El rojo significa algo.** Solo para: el jugador (cinta/ropa), la sangre, el peligro (ataques que te van a dar, zonas de daño, jefes) y la interfaz importante (vida, sellos de combo). Si todo es rojo, nada destaca.
3. **Valores antes que colores.** Primero que se lea en blanco y negro (captura en escala de grises): el jugador y los enemigos tienen que separarse del fondo sin ayuda del color.
4. **Brillo = excepción.** Brasas, rayos y bendiciones pueden brillar (aditivo), pero pequeños y breves. El brillo es el único sitio donde aparece otro color (naranja de brasa, color de cada kami).
5. **Formas de pincel.** Bordes irregulares, manchas, salpicaduras y trazos con punta, nunca círculos perfectos ni degradados suaves.

## Paleta propuesta

| Uso | Color | Hex |
|---|---|---|
| Papel (fondo, niebla) | blanco hueso | `#efe9df` |
| Papel en sombra / suelo | hueso | `#d8d0c2` |
| Gris de aguada (lejos, edificios) | tinta diluida | `#8a857e` |
| Tinta (enemigos, contornos) | negro cálido | `#1a1817` |
| Negro puro (sombra de contacto) | negro | `#0b0a0a` |
| Rojo principal (jugador, peligro, UI) | bermellón | `#c8102e` |
| Sangre | rojo oscuro | `#7a0a14` → charcos casi negros |
| Excepción: brasas, chispas | naranja fuego | `#ff7a1a` |

Ahora mismo (para comparar): niebla y cielo `FOG = #d4b199` (arena), luz hemisférica `0xfff0dc / 0x5e4038`, direccional `0xffe2c4`, rojo `REDC ≈ #c40f1f`, sangre `BLOOD ≈ #9e0812`. Materiales: 21 Basic, 16 Lambert y 4 Standard.

**Decidido con Daniel (27 nov 2026):** los colores de los kami (Raijin amarillo, Yuki-onna azul…) se quedan **solo en los brillos** (rayos, llamas, escarcha); el resto del cuerpo y la interfaz siguen en blanco, negro y rojo.

## Técnicas, de más barata a más cara (todas funcionan en r128)

| # | Técnica | Cómo | Coste en móvil | Prioridad |
|---|---|---|---|---|
| 1 | **Paleta y niebla de papel** | Cambiar `FOG`, luces neutras, suelo hueso, edificios en aguada, enemigos en tinta | Gratis | Primero |
| 2 | **Sombreado en 2-3 tonos** (toon) | `onBeforeCompile` en los Lambert (como `zmodel.js`) o `MeshToonMaterial` con `gradientMap` de 3 píxeles en `NearestFilter` | Casi gratis | Primero |
| 3 | **Contorno de tinta del modelo** | «Casco invertido»: la misma malla instanciada por detrás (`BackSide`), inflada a lo largo de la normal en el shader y pintada de negro. Una llamada de dibujo más | Bajo | Alta |
| 4 | **Contorno de los palos** | Segmentos negros un poco más gruesos debajo de los de color en los lotes `ZB_SEG/ZB_SPH` | Bajo | Alta |
| 5 | **Sangre como tinta** | Charcos y decals con borde irregular de salpicadura (textura o ruido en el shader), rojo → casi negro al secarse | Bajo | Alta |
| 6 | **Estela del arma a pincel** | Textura de trazo con punta y grano seco en la estela (`trMat`): negra, roja con bendición | Bajo | Media |
| 7 | **Papel y viñeta** | Capa CSS encima del canvas con textura de papel (`mix-blend-mode: multiply`) y viñeta. No toca la GPU del juego | Bajo | Media |
| 8 | **Golpe en negativo** | En críticos y esquiva perfecta, 1-2 fotogramas con la imagen invertida (tinta ↔ papel) y el rojo intacto. Muy de cómic | Bajo | Media |
| 9 | **Sellos rojos (hanko)** en la UI | Combos, bajas de jefe, bendiciones: sello rojo que se estampa con un pequeño temblor | Gratis (CSS) | Media |
| 10 | **Brillo falso** | Sprites aditivos como las brasas (`embers`) en vez de bloom de pantalla completa | Bajo | Media |
| 11 | **Rojo selectivo en posprocesado** | `ShaderPass` que pasa todo a gris salvo el rojo (o una LUT «solo rojo») | Alto (pantalla completa) | Solo calidad 2, o nunca |
| 12 | **Contornos por bordes (Sobel) / tramado** | Pasada de posprocesado con profundidad y normales | Alto | Solo calidad 2 |
| 13 | **Bloom real** (`UnrealBloomPass`) | Varias pasadas a pantalla completa | Muy alto | Evitar en móvil |

**Presupuesto móvil:** como mucho **una** pasada a pantalla completa, y solo en calidad 2. Todo lo demás, en los materiales y en los lotes. Referencia de rendimiento actual: ~46 fps con CPU ×4 en la oleada 6 (prueba t26).

## Estado (27 nov 2026)
Hechos los pasos 1-4 y la parte «enemigos en tinta» (interruptor «🖌 Estilo tinta», código en el bloque «ESTILO TINTA» de `index.html` y `ZM.outline` en `models/zmodel.js`). Paleta aplicada: niebla `#e8e1d4`, suelo `#d9d0c0`, laterales `#2e2a28`, techos `#77706a`, pagodas `#a59d92`, sol `#c8102e`. Pruebas: t35/t36 (capturas antes/después), t38 (43,7 fps con tinta frente a 46,2 sin ella). Siguen pendientes los pasos 5 (sangre como salpicadura) a 10.

## Editor de shaders y protagonista (28 nov 2026)
- Todos los números del estilo viven en `models/inkstyle.js` y se ajustan en `shaders.html` (escena de prueba como la del juego); el juego del mismo sitio los usa al momento. Los pesos y el esqueleto de los modelos se ajustan en `modelo.html`.
- Protagonista 3D en **tinta aguada** (inspirado en el guerrero de Grease Pencil de 80.lv): papel y tinta según la luminosidad de su textura, grano de pincel, borde de silueta a pincel seco y el rojo del fajín conservado.

## Cómo lo probaríamos
1. Interruptor «🖌 Estilo tinta» en la armería (`KGFX.ink`), para comparar con el aspecto actual.
2. Pasos 1-5 de la tabla primero; capturas antes/después (en color y en escala de grises) y prueba de rendimiento t26.
3. Daniel lo prueba en el móvil desde `dev`; si gusta, se siguen los pasos 6-10.
4. Al cambiar el estilo, actualizar capturas, textos de ayuda y este documento.

## Referencias

**Tinta y aguada**
- [Codrops: «Still», de Akira a la tinta aguada en WebGPU](https://tympanus.net/codrops/2026/09/09/still-from-akira-to-ink-wash-building-a-generative-garden-in-webgpu/): sombras en aguada y bordes dibujados en el shader.
- [Tesis del Trinity College (2020) sobre sumi-e en tiempo real](https://publications.scss.tcd.ie/theses/diss/2020/TCD-SCSS-DISSERTATION-2020-056.pdf): resume la técnica clásica de Kang et al. (2003), con trazos de pincel en los bordes.
- [Blog: desarrollo de un shader de tinta](https://23008102.myblog.arts.ac.uk/2026/03/22/ink-shader-development/): prueba el casco invertido y el filtro Sobel.
- [Sumi-e demo shader (itch.io)](https://mharitsnf.itch.io/sumi-e-demo-shader) y [Ink brush effect (itch.io)](https://kattk.itch.io/ink-brush-effect).
- [80.lv: guerrero a tinta aguada con Grease Pencil](https://80.lv/articles/warrior-sketched-with-grease-pencil-geometry-nodes-powered-ink-wash): referencia visual.
- [Foro de Three.js: shader pictórico con textura de pincel](https://discourse.threejs.org/t/painterly-shader-with-brush-texture-in-three-js/80770) y [brush-renderer](https://www.github.com/madblade/brush-renderer).

**Contornos y tramado**
- [Maxime Heckel: posprocesado estilo Moebius](https://blog.maximeheckel.com/posts/moebius-style-post-processing): contornos, sombras tramadas y cómo montar una pasada propia.
- [Codrops: efecto de lápiz con posprocesado en Three.js](https://tympanus.net/codrops/2022/11/29/sketchy-pencil-effect-with-three-js-post-processing/).
- [Foro de Three.js: contornos completos como posprocesado](https://discourse.threejs.org/t/how-to-render-full-outlines-as-a-post-process-tutorial/22674).
- [Godot Shaders: contorno Moebius + tramado](https://godotshaders.com/shader/mobius-outline-hatching/) (la idea se pasa a GLSL).

**Rojo selectivo y color**
- [Gist con LUT «solo rojo» y «blanco y negro» para Three.js](https://gist.github.com/mathcodes/eaa4f49f0b8ad6f301ead1f66042807d).
- [Manual de Three.js: posprocesado y `ShaderPass`](https://neofixer.arizona.edu/css/CSSOrbit/asteroidJS/three/manual/en/post-processing.html).
- [Foro de Unity: escala de grises salvo un color](https://discussions.unity.com/t/modifying-greyscale-shader-for-selective-colouring/37642) (la lógica se pasa a GLSL).

**VFX en general**
- [Codrops: disolver con shaders y partículas](https://tympanus.net/codrops/2025/02/17/implementing-a-dissolve-effect-with-shaders-and-particles-in-three-js/) (base de la ceniza actual).
- [80.lv: disuelto estilo God of War](https://80.lv/articles/play-with-this-god-of-war-inspired-dissolve-effect-made-with-glsl-in-your-browser), [GameDev.net: disuelto con borde](https://gamedev.net/shaderlab/14-sprite-dissolve-effect/), [Godot Shaders: dissolve con borde de fuego](https://godotshaders.com/shader/2d-dissolve-with-burn-edge/).
- [three.quarks](https://npmjs.com/package/three.quarks) y su [guía](https://alexandrubagu.github.io/blog/three-quarks-particle-guide.html) (necesita Three.js moderno: solo como inspiración), [Wawa VFX](https://unpkg.com/wawa-vfx@1.0.16/README.md), [NixieFX](https://discourse.threejs.org/t/nixiefx-browser-particle-editor-with-an-open-source-three-js-runtime/93646).
- [The Book of Shaders](https://thebookofshaders.com/), [Shadertoy](https://www.shadertoy.com/) y los [ejemplos oficiales de Three.js](https://threejs.org/examples/).

## Bibliotecas (estado)
- Seguimos en **r128**. Sirve todo lo de `examples/js` de r128: `EffectComposer`, `ShaderPass`, `UnrealBloomPass`, `OutlinePass`, `GLTFLoader`; y `MeshToonMaterial`.
- Fuera mientras sigamos en r128: three.quarks, `postprocessing` de pmndrs (versión actual) y TSL. Se usan como inspiración y se reproduce la idea a mano.
- Si algún día hace falta Three.js moderno: dividir `index.html` en archivos `.js` normales y cargar Three.js con un módulo pequeño que lo deje en `window.THREE`. Habría que reajustar colores y luces (gestión de color desde r152) y los shaders inyectados.

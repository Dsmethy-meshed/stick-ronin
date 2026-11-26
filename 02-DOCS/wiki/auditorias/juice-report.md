# Auditoría de game feel — Stick Rōnin 3D (v1.5)

Fecha: 26 nov 2026 · Herramienta: skill `juice-scan` (escáner + lectura del código) · Archivo: `index.html` · Solo lectura: no se ha cambiado el juego.

**Cobertura:** el escáner marcó 80 momentos en 499 funciones. He leído a mano los 15 que más pesan: `sfx`, `initAudio`, `bindBtn`, `updatePlayer` (salto y búferes), `hitZombie`, `hitRag`, `slam`, `killZombie`, `hurtPlayer`, `deflect`, `fireKF`, `onKill`, el paso del juego con el decaimiento del shake, `placeCamera`, `hud` y `frame`. El resto (forja, multijugador, guardado) está fuera de este informe.

**Tipo de feel (P-23):** control en tiempo real + espacio simulado + pulido. Es un hack-and-slash de hordas en móvil, así que el feel del golpe y la respuesta táctil mandan.

## Lo que ya está muy bien

El juego tiene más juice que la mayoría de prototipos:
- **Hit-stop** escalado por arma y golpe (`killZombie` 1850, `slam`, `deflect` 1422).
- **Shake** con techo (`Math.max`) y **FOV kick** según la fuerza.
- **Slow-mo** al morir y como evento de los clips del editor (`fireKF` 2073: `shake`, `hitstop`, `slowmo`, `flash`, `sparks`…). Eso significa que el feel de cada ataque ya se edita por fotogramas en el editor.
- **Búferes de entrada:** salto 0,13 s, dash 0,13 s, gancho 0,15 s, ataque 0,18 s (`updatePlayer` 1527). Coyote time 0,1 s (línea 1651). Parry con ventana de 0,2 s.
- **Sonido procedural** con muchas capas (`sfx` 656) y antirepetición de 35 ms por sonido.
- **Combo** con pop de escala en el HUD (`hud` 3294).
- **Rendimiento:** las partículas se recortan cuando hay muchas (`spray` 448) y el modo ligero sustituye la sangre por charcos.

El escáner avisó de que no había coyote time ni búfer de salto: **es un falso positivo**, sí los hay.

## Propiedades medidas en el código (P-24, P-25)

| Propiedad | Valor | Dónde |
|---|---|---|
| Paso fijo | 1/60 s | `index.html:269` (`DT`) |
| Gravedad | 24 u/s² | `index.html:269` (`G`) |
| Velocidad de salto | 9,5 a 13 según acción | 1625, 1631, 2522, 3066 |
| Coyote time | 0,1 s | 1651 |
| Búfer salto / dash / gancho / ataque | 0,13 / 0,13 / 0,15 / 0,18 s | 1529-1531 |
| Vida / invulnerable tras golpe | 100 / 0,7 s | `resetGame` 946, `hurtPlayer` 1119 |
| Tope de partículas / ragdolls | 1000 / 15 (6 en modo ligero) | 420, 1755 |
| Decaimiento del shake y del FOV kick | ×0,88 por paso (~7,7/s) | 3159 |

## 💥 Quick wins (impacto ≥ 2, esfuerzo 1)

### S-01 · Vibración en los golpes (Android)
- **Momento:** recibir daño, parry, golpe a jefe. **Dónde:** `hurtPlayer` (1119), `deflect` (1422), `killZombie` (1850, solo golpes contundentes).
- **Por qué:** P-10 y P-04, la parte háptica del impacto. Ahora solo vibra al arrastrar en la forja (línea 2907); en combate no vibra nunca. En un juego táctil es el canal más barato que falta.
- **Parámetros (de partida):** daño recibido, un zumbido de 25 ms; parry, un doble pulso `[15,30,15]`; golpe contundente o jefe, 12 ms. **Nunca** en cada baja normal, porque con 90 zombis sería un zumbido continuo.
- **Boceto:**
  ```js
  const HAPT={on:true};function buzz(p){if(HAPT.on&&navigator.vibrate)try{navigator.vibrate(p)}catch(_){}}
  // hurtPlayer, tras sfx('hurt'):  buzz(25)
  // deflect, tras sfx('parry'):    buzz([15,30,15])
  ```
- **Accesibilidad:** interruptor «Vibración» (S-09). Impacto 3 · esfuerzo 1.

### S-02 · Variación de tono en los sonidos
- **Dónde:** `sfx` (656), `noise` (654), `tone` (655).
- **Por qué:** P-09. Al matar a muchos seguidos, `slice`, `splat` y `blunt` suenan siempre idénticos (efecto ametralladora). El escáner lo confirma: no hay variación de tono.
- **Parámetros:** ±6 % aleatorio por reproducción (factor `rand(.94,1.06)` sobre `f0` y `f1`) y ±10 % de volumen.
- **Boceto:** un multiplicador global `PV` que `sfx` fija antes de cada `switch`, y que `tone` y `noise` aplican a sus frecuencias.
- Impacto 3 · esfuerzo 1.

### S-03 · Bus maestro con compresor
- **Dónde:** `initAudio` (653). `noise` y `tone` conectan directo a `AC.destination`.
- **Por qué:** P-09 y P-15. En hordas suenan decenas de sonidos a la vez; `boom` llega a 0,9 y `blunt` a 0,65 sin margen, así que satura. El escáner lo señala como `audio_no_headroom`. Además, sin bus no hay forma de poner un control de volumen.
- **Parámetros:** `MASTER = Gain(0.8) → DynamicsCompressor(threshold −14 dB, ratio 4, attack 3 ms, release 120 ms) → destination`.
- Impacto 2 · esfuerzo 1.

### S-04 · Botones táctiles que se hunden
- **Dónde:** CSS `.b.on` (221) y `bindBtn` (711).
- **Por qué:** P-01 y J2. Ahora al pulsar solo cambia el color. Un pequeño hundido confirma la pulsación con el dedo encima del botón, que tapa el color.
- **Parámetros:** `transform:scale(.9)` al pulsar, vuelta en 150 ms con `cubic-bezier(.34,1.56,.64,1)` (ease-out-back).
- **Boceto:** `.b{transition:transform .15s cubic-bezier(.34,1.56,.64,1)}.b.on{transform:scale(.9)}`
- **Accesibilidad:** sin movimiento si `prefers-reduced-motion`. Impacto 2 · esfuerzo 1.

### S-05 · Hit-stop que se acorta en ráfagas
- **Dónde:** `killZombie` (1850, `hitstop=Math.max(...)`) y `frame` (4015).
- **Por qué:** P-04, más la tabla de la skill: «acortar en golpes rápidos repetidos». Con un giro o un barrido que mata un zombi cada pocos fotogramas, cada baja vuelve a poner 0,05 s de congelación. En hordas, el juego se nota a tirones, como si fuera lento.
- **Parámetros:** si la última congelación fue hace menos de 0,15 s, multiplica la nueva por 0,35. Tope de 0,25 s congelados por segundo. Los golpes «firma» (parry, jefe, slam cargado) quedan exentos.
- **Boceto:**
  ```js
  let hsLast=-9;function addStop(s,big){const k=(!big&&time-hsLast<.15)?.35:1;hsLast=time;hitstop=Math.max(hitstop,s*k)}
  ```
- Impacto 3 · esfuerzo 1.

### S-06 · Escalera de tono en el combo
- **Dónde:** `killZombie` (1855, `combo++`) y `sfx('slice'|'blunt')`.
- **Por qué:** P-11. El combo sube en pantalla, pero suena igual en ×2 que en ×20.
- **Parámetros:** desde la 3.ª baja seguida, +1 semitono por paso (`2**(n/12)`), con tope en +4. Vuelve a cero cuando se rompe el combo (`comboT` llega a 0).
- Impacto 2 · esfuerzo 1.

## 🔧 Cambios medianos (esfuerzo 2)

### S-07 · Shake con modelo «trauma» y ruido suave
- **Dónde:** `placeCamera` (3165) y el decaimiento en 3159.
- **Por qué:** P-04 y la tabla de la skill. Ahora el desplazamiento es aleatorio puro, distinto en cada fotograma de render. En móviles de 90-120 Hz vibra «a ruido» y los golpes pequeños tiemblan casi tanto como los grandes.
- **Parámetros:** `trauma += 0,2-0,5` por golpe y baja 1,2 por segundo. Desplazamiento = `0,25 × trauma² × ruido suave` (seno de 2-3 frecuencias, o Perlin). Rotación ≤ 2°.
- **Accesibilidad:** «Temblor de cámara» al 0 / 50 / 100 % (S-09). Impacto 2 · esfuerzo 2.

### S-08 · Destello de daño sin filtro CSS sobre el canvas
- **Dónde:** `hud` (3297): `renderer.domElement.style.filter = saturate(...) brightness(...)`.
- **Por qué:** P-17 y rendimiento. Un filtro CSS sobre todo el canvas WebGL obliga al móvil a componer la pantalla entera cada fotograma mientras dura (0,5 s), justo cuando más enemigos hay. Además lava toda la imagen, cuando el aviso debería ir en los bordes.
- **Parámetros:** un `div` fijo con viñeta roja (`radial-gradient`, transparente en el centro) y opacidad = `dmgFlash × 1,2`. Así no se toca el canvas.
- Impacto 2 (más rendimiento) · esfuerzo 2.

### S-09 · Ajustes de comodidad para el jugador
- **Dónde:** no existe un menú de ajustes para el jugador; las «Opciones» de la línea 3125 son solo del dojo.
- **Por qué:** P-18 y J12. Hay shake, FOV kick de hasta 22°, slow-mo y destellos, y ningún interruptor. El `prefers-reduced-motion` del CSS solo afecta a los menús.
- **Contenido (con iconos, nada de texto largo):** 📳 Vibración · 🎥 Temblor 0/50/100 % · 🔊 Volumen (usa el bus de S-03) · 🌀 Movimiento reducido (sin FOV kick ni slow-mo y shake al 30 %). Por defecto, el movimiento reducido toma el valor de `prefers-reduced-motion`. Se guarda en `localStorage`.
- Impacto 2 · esfuerzo 2. Lo necesitan S-01 y S-07.

### S-10 · Partículas reutilizadas (pool)
- **Dónde:** `addP` (432) hace `parts.push(o)` con un objeto nuevo en cada llamada; también `sparks` (457), `dust` y `smoke`.
- **Por qué:** P-15 y rendimiento en móvil. En hordas se crean cientos de objetos por segundo, y el recolector de basura de JavaScript provoca tirones. CLAUDE.md dice que lo que más pesa es dibujar; esto es el segundo frente.
- **Parámetros:** una lista libre de 1000 objetos (`PM`); `addP` reutiliza uno y al morir vuelve a la lista. Además, `sparks` debería recortarse con muchas partículas, como ya hace `spray`.
- Impacto 2 · esfuerzo 2.

### S-11 · Sonidos de enemigos según la distancia
- **Dónde:** el audio de `spawnSpider` (2176), `spawnYokai` (2290) y `siegeSpawn` (3755).
- **Por qué:** P-09. El escáner lo marca como `audio_no_falloff`: un yokai al otro lado del mapa suena igual de alto que tu katana.
- **Parámetros:** `sfx(n, pos)` con ganancia `max(0,15, 1 − d/25)` respecto al jugador.
- Impacto 1 · esfuerzo 2.

## ⭐ Momentos firma (1-3 por juego)

### S-12 · La baja del jefe
- **Dónde:** `onKill` (2655), cuando `kind` es `ooni` o `karura`, junto a `bossLoot` (2651).
- **Por qué:** P-04 y P-12. Ahora un jefe muere con el mismo feedback que un zombi grande. Es el momento que el jugador debería recordar.
- **Secuencia (de partida):**
  1. Hit-stop de 0,14 s.
  2. Slow-mo de 0,7 s a 0,3× (`slowT`).
  3. Destello blanco de 0,1 s a opacidad 0,5.
  4. FOV kick de +14 y `boom` con el tono un 15 % más grave.
  5. Vibración `[30,40,60]`.
  6. Banner con el kanji del jefe: «大鬼 討伐» o «迦楼羅 討伐».
  7. Al terminar el slow-mo, el botín sale disparado.
- **Accesibilidad:** el movimiento reducido quita el slow-mo y el destello. Impacto 3 · esfuerzo 2-3.

### S-13 · La última baja de la oleada
- **Dónde:** `updateWaves`, cuando la oleada queda a cero.
- **Por qué:** P-12. Cierra cada oleada con un «golpe final» y marca el paso al descanso o a la forja.
- **Secuencia:** slow-mo de 0,35 s, un anillo (`ring`) en el último enemigo y el sonido `ready` subido una octava.
- Impacto 2 · esfuerzo 2.

## ⚠️ Exceso de juice y accesibilidad

- **Sin ningún ajuste de comodidad** (P-18): shake, FOV kick de hasta 22° en el slam contundente (`slam`), slow-mo y destellos sin interruptor → S-09.
- **Hit-stop encadenado en hordas** (P-04, P-16): puede sentirse como lag → S-05.
- **FOV kick grande:** de +22° en un cuarto de segundo marea a algunos jugadores. Con movimiento reducido, tope de +6.
- **El destello de daño** tiñe toda la pantalla (P-17) → S-08. Su frecuencia está bien: con 0,7 s de invulnerabilidad no pasa de 3 por segundo.
- **No he visto efectos en cada fotograma sin tope:** el shake y el FOV usan `Math.max`, y las partículas tienen límite.

## No comprobado

- **El feel en vivo:** milisegundos entre el toque y la respuesta, congelaciones reales y cómo se nota en un Android real. Hay que medirlo con el juego en marcha, con el MCP `threejs-devtools` o con Playwright.
- **Los clips del editor:** los eventos `fireKF` (shake, hitstop, slowmo por ataque) viven en `localStorage`, no en el código. Su intensidad hay que revisarla en el editor.
- **El volumen real** de los sonidos sintetizados: solo he leído los valores del código.
- **Forja, multijugador y asedio:** solo los he mirado de pasada.

## Orden recomendado

1. S-05 (hit-stop en ráfagas) + S-02 (tono) + S-03 (compresor): lo que más se nota en hordas.
2. S-09 (ajustes) → S-01 (vibración) + S-04 (botones).
3. S-08 y S-10, que además dan rendimiento en móvil.
4. S-12 y S-13, los momentos firma.

Cada cambio debe aplicarse a todo lo relacionado (regla 4 de `CLAUDE.md`: menú ℹ Info, guías y notas de versión) y probarse en móvil antes de pasar a `main`.

# Registro de cambios de juice

## 2026-11-26 · S-05, S-02 y S-03 (rama `dev`)

**Archivo:** `index.html`. Bloque `JUICE` al principio de la sección AUDIO; función `hitstopBurst()` justo antes de `frame()`.

| Mejora | Interruptor | Constantes (valor inicial) |
|---|---|---|
| S-05 Hit-stop en ráfagas | `JUICE.hsBurst` | `HS_WINDOW .15` s · `HS_REPEAT_K .35` · `HS_BIG .08` s (exento: parry, slam cargado, eventos del editor, jefes) · `HS_MAX_PER_SEC .25` s |
| S-02 Variación de tono y volumen | `JUICE.pitchVar` | `PITCH_VAR .06` (±6 %) · `VOL_VAR .1` (±10 %) |
| S-03 Bus maestro + compresor | `JUICE.master` | `MASTER_GAIN .8` · `COMP_THRESHOLD -14` dB · `COMP_RATIO 4` · `COMP_ATTACK .003` s · `COMP_RELEASE .12` s |

**Cómo revertir:** pon el interruptor a `false` y el juego se comporta como antes. Para quitar el código: el bloque `JUICE`, las variables `OUT`, `PV` y `VV` (sección AUDIO), `hitstopBurst()` y sus dos llamadas en `frame()` (`hitstopBurst(now/1000)` y `hsLeft=...`).

**Comprobado (navegador, copia de prueba):**
- El bus maestro existe (`GainNode` → compresor).
- El tono de `slice` sale distinto en cada reproducción (0,955 a 0,988).
- Hit-stop: el primer golpe es completo (0,05 s), el segundo de la ráfaga baja a 0,0175 s, el golpe firma no cambia (0,1 s) y el tope de 0,25 s/s corta el resto.
- Con el interruptor apagado se mantiene el valor original.
- 20 bajas en ráfaga con 40 zombis: 0 errores.
- De punta a punta, en el bucle real (`frame`), 6 bajas normales en 0,36 s: **305 ms congelado sin la mejora y 137 ms con ella**, 0 errores.
- Revisión de 3 revisores (corrección, seguridad y pruebas). Hallazgo corregido: un golpe firma que llegaba con congelación residual se medía por el incremento y se acortaba. Ahora se mira el valor pedido (`hitstop>=HS_BIG`). Comprobado en node: el parry con 0,05 s de resto se queda en 0,1.

**Escáner, antes y después:** sigue marcando `no_pitch_variation` y `audio_no_headroom`, porque solo busca nombres como `playbackRate` o `detune` y no entiende el audio sintetizado. Es un falso positivo: la prueba en el navegador confirma el cambio.

**Qué probar al jugar:** hordas de la oleada 6 o más con barridos y giros. Si los golpes encadenados se sienten flojos, sube `HS_REPEAT_K` a 0,5. Si todavía hay tirones, baja `HS_MAX_PER_SEC` a 0,18.

**Nota:** el sonido actual es provisional y se va a cambiar por una biblioteca. El bus y la variación de tono siguen valiendo: con muestras, el tono se aplica con `playbackRate`.

## 2026-11-26 · Muerte de los zombis: ragdoll o desmembrado cinemático (rama `dev`)

**Pedido por Daniel:** el cuerpo entero girando hacia atrás (`flyCorpse`), que salía con muchos enemigos, se sentía mal. Quería que siempre salieran desmembrados.

**Regla nueva (`GORE.on`):**
- **Menos de 20 zombis vivos** (`GORE.RAG_BELOW`): ragdoll con física, como siempre.
- **20 o más**, o si se llena el cupo de ragdolls: desmembrado cinemático (`dismember`). El zombi se parte por el plano del corte; con arma contundente salen 1-2 miembros y a veces la cabeza. Cada trozo sale en la dirección del golpe, separándose del corte, y gira hacia delante. Rebota una vez (`BOUNCE .32`) con polvo y charco de sangre, y queda tirado; los muñones sangran 1,2 s.
- A los 1,1 s (`CONVERT_T`), de los 2 trozos más grandes salen los 2 minis. Los trozos de un mini se hunden a los 2,6 s.
- El fin de oleada y el contador del HUD cuentan los minis pendientes de los trozos.

**Constantes:** `RAG_BELOW 20 · CUT_MAX 3 · SPIN_MIN/MAX 6/12 · BOUNCE .32 · BOUNCE_MIN_VY 3 · CONVERT_T 1.1 · MINI_LIFE 2.6 · SINK_T .5 · MAX_CORPSES 40`.

**Revertir:** `GORE.on=false` vuelve a los cupos antiguos y a `flyCorpse`.

**Rendimiento:** la física de un ragdoll cuesta unos 0,004 ms por paso (PC); el trozo cinemático, menos, porque no tiene restricciones ni colisiones con cajas. El dibujo es igual en los dos casos (los mismos lotes `ZB_SEG`/`ZB_SPH`). Efecto neutro o ligeramente positivo; la mejora es visual.

**Comprobado (navegador, copia de prueba):**
- 14 bajas con más de 20 zombis: 14 cadáveres en 39 trozos, 28 minis (2 por baja, como antes), 0 `flyCorpse`, 0 errores.
- Con 12 zombis: se usa el ragdoll.
- Captura: los trozos vuelan hacia fuera desde el jugador.

**No comprobado:** cómo se siente en un Android real, ni los fps en el móvil.

**Pruebas añadidas tras la revisión de 3 revisores** (corrección y seguridad aprueban; el de pruebas pidió más evidencia):
- **Umbral:** con 19 zombis, ragdoll; con 20 y 21, desmembrado.
- **Fin de oleada:** a los 0,5 s con trozos pendientes, `waveBreak` sigue en 0; a los 1,5 s han salido los 2 minis.
- **Contraprueba:** si se ignoran los trozos, la oleada termina antes de tiempo (`waveBreak` 2,32). Esto demuestra que la condición nueva es necesaria.
- **Expulsión:** 45 bajas seguidas dejan 40 cadáveres como máximo y 90 minis en total (2 por baja, ninguno perdido).
- **Muerte de un mini:** `convert` es false, no crea minis y se borra a los ~3,1 s.
- **`GORE.on=false`:** vuelve `flyCorpse` (7 de 10) y no se usa el desmembrado.
- **Reinicio:** `resetGame` vacía `CORPSES`.
- **`rotAx`:** conserva la longitud en 20 000 casos aleatorios y el ángulo 0 deja el vector igual (revisor de pruebas, en node).
- 0 errores en todas.

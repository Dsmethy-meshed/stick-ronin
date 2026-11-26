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

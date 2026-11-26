# Stick Rōnin 3D — contexto del proyecto

Survivor 3D de stickmans con armas japonesas, pensado sobre todo para **móvil (Android)**: oleadas de zombis, yokai y jefes, forja de armas y multijugador.
El desarrollador es Daniel. Escribe en español y juega en Android (a veces en PC). **Responde siempre en español.**

Versión publicada: **v1.5 (26 nov 2026)**, en GitHub Pages: repositorio `Dsmethy-meshed/stick-ronin`, rama `main`.

---

## Reglas de trabajo (acordadas, obligatorias)

1. **Dos ramas en GitHub (acordado el 26 nov 2026):**
   - **`dev`:** se sube cada cambio en cuanto funcione, sin pedir permiso. Es la rama de pruebas.
   - **`main`:** es lo que publica GitHub Pages y ven los jugadores. Solo se fusiona `dev` en `main` cuando Daniel lo aprueba explícitamente.
   - Nunca hacer push forzado a `main`.
2. **El editor de animaciones (`editor.html`) puede estar en GitHub** como copia de seguridad (cambio del 26 nov 2026). Hay que tener en cuenta que en Pages es público por su enlace.
3. **Nada de grabar ni enviar vídeos de gameplay**, salvo que lo pida expresamente.
4. **Cuando cambies algo del juego, aplícalo a todo lo relacionado:** guías, textos de ayuda, menú ℹ Info, descripciones de armas, guía de la forja, notas de versión y hoja de cálculo de equilibrio. No te saltes pasos.
5. **Todas las animaciones de ataque deben poder editarse en el editor.** Sé consecuente: si añades o cambias un ataque, que el editor lo tenga.
6. **Cada vez que publiques en `main`** (en `dev` no hace falta):
   - sube `GAME_VER`, `GAME_DATE` y `GAME_NOTES` en `index.html`;
   - actualiza `version.json` igual. La barra de aviso de actualización solo comprueba en `github.io`.
   - La próxima versión será la 1.6.
7. **Datos de Daniel:**
   - No crear cuentas ni meter contraseñas o códigos por él.
   - No borrar datos de su hoja de Google sin su aprobación explícita.
   - Pendiente: hay 19 filas de prueba con nombre "T" en la hoja del ranking (id `17dUqM092IVWJRi2l0a61UrMHlbh-9FudIxSxHqTT3a8`). Están sin borrar porque falta su permiso.
8. **Estilo:**
   - Muy arcade.
   - Visual antes que texto: iconos, brillos y animaciones en vez de descripciones largas.
   - Pensado para pantalla táctil.

---

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | El juego completo en un solo archivo (~470 KB, ~4000 líneas). Three.js r128 desde cdnjs. |
| `version.json` | Versión publicada (`v`, `date`, `notes`) para el aviso de actualización. |
| `editor.html` | Editor de animaciones por fotogramas clave. Está también en GitHub como copia. |
| `README.md` | README público corto. |

Servicios externos que usa el juego:
- **PeerJS 1.5.4** (jsdelivr) para el multijugador WebRTC. Con `?bc=1` usa BroadcastChannel para probar en local.
- **Ranking:** Google Apps Script `https://script.google.com/macros/s/AKfycbwB36PZrlqC5Rz6z1eIVKgliHAo6LobhkVDa8JLKvHVfVlh1vEZuni2rf7wWfY-g7hrQw/exec`. `submitScore` no envía desde localhost.
- **Sentry:**
  - Proyecto `stick-ronin-3d` en la organización `dsmeshyind` (región `https://de.sentry.io`), conectado como conector en Claude.
  - Loader en el `<head>`. Solo envía errores: sin replays ni trazas, y nada desde localhost.
  - `safeRun()` manda cada error distinto una vez por partida, con tags (dónde, versión, modo, calidad, móvil) y contexto (oleada, estado, arma, nº de enemigos…).
  - En el enlace de artefacto de Claude no funciona, porque su CSP bloquea el script. Sí funciona en GitHub Pages.

---

## Arquitectura de `index.html` (lo esencial)

### Bucle y render
- `frame()` llama primero a `requestAnimationFrame` y luego ejecuta pasos fijos `step()` (DT fijo) y `draw()`, todo envuelto en `safeRun(f, where)`. Así un error no congela el juego: se registra en `window.__errs` y se manda a Sentry.
- Render con lotes propios: `mkBatch` + `bSeg/bSph/bEll`.
  - Pools `SEG, SPH, SEGL, SPHL, FIL, GHO, ZB_SEG, ZB_SPH, DSK` (sombra redonda) y `POOLB` (charcos de sangre).
  - `poolBegin()` y `poolEnd()` los resetean y vuelcan.
- Calidad `quality` 0/1/2:
  - **2:** pixelRatio ≤1,25 y sombras 1024.
  - **1:** pixelRatio ≤1 y sombras 512.
  - **0:** pixelRatio ≤0,75 y sin sombras.
  - En móvil (`IS_MOBILE`) no hay antialias y se empieza en calidad 1.
  - Baja si la media supera 24 ms por fotograma. Sube si lleva unos 4 s por debajo de 18,5 ms y han pasado más de 20 s desde la última bajada.
- **Modo ligero `goreLite()`:** desde la oleada 5, o con más de 45 entidades.
  - `spray()` ya no crea partículas; agranda charcos con `bloodPool()`.
  - Ragdolls con física: como mucho 6, y 1 por tick.
  - El resto de muertos salen volando con `flyCorpse()`, una animación cinemática sin física dibujada con `drawTumbler`.

### Personajes
- `finishPose(head,neck,pel,hL,hR,fL,fR,ext)` → 12 articulaciones `J`.
- `BONES=[[0,1],[1,2],[2,3],[1,4],[4,5],[1,6],[6,7],[3,8],[8,9],[3,10],[10,11]]`. J[0] es la cabeza, J[3] la pelvis, J[7] la mano derecha y J[9]/J[11] los pies.
- `toW(o,yaw,l)` pasa de coordenadas locales a mundo; `dirW(yaw,l)` hace lo mismo con direcciones.
- `drawChar`, `makeRag` (ragdoll verlet), `rags`.

### Ataques
- **Procedurales:** tabla `ATK` con `dirAt(a,tilt)`.
- **Por fotogramas clave (KF):** clips del editor con ranuras `arma:tecla`.
  - `kfSample` devuelve también `we`/`wo` (separación y desplazamiento del arma respecto a la mano).
  - `kfWPos` da la posición del arma.
  - La estela y los golpes salen de la posición del arma.
- **Armas `WT`** (12): katana, maza (kanabō), nito, odachi, naginata, yari, kusarigama, tessen, kama, tanegashima, yumi y shuriken.
  - Cada una tiene `special` y, algunas, `tap`.
  - Nombres de los especiales en `SPN`.

### Enemigos
- Todos viven en `zs`.
- **Zombis:** `addZombie`, `killZombie`. Tienen golpes de vida `shp` según la oleada: 1 + 1 cada 4 oleadas; en el asedio, 4 + 1 cada 3.
- **Arañas y yokai:** llevan `spider:true` y no cuentan para acabar la oleada. Los yokai además tienen `kind`. Al superar la oleada, `clearWaveLeftovers()` los borra.
- **Yokai:**
  - Comportamiento en `YK[kind].update/pose/draw`. Se crean con `spawnYokai(kind, ang, opt)`, reciben golpes con `yokaiHit(S,hit,dmg)` y mueren con `procKill`.
  - Vida ×(1 + 0,12·(oleada−1)); jefes ×(1 + 0,1·(oleada−1)).
- **Onis de colores:**
  - `ONI_V`: aka mazazo, ao lanza 2, ki salta con onda, midori embiste, kuro grande.
  - Se asignan con `oniVariant`. `oniRaid(n)` lanza incursiones de hasta 10 desde la oleada 4; esos onis llevan `raid` y sí cuentan para acabar la oleada.
- **Variantes de minijefes:**
  - `YV` + `ykVariant` para kappa (aka, ao, kin), kasa (ao se parte, hi explota, arashi), rokuro (nagai, futa, kuro) y tengu (karasu, konoha, oo).
  - Salen desde la oleada 3. `ykOnDeath` gestiona lo que pasa al morir.
- **Jefes:**
  - **大鬼 Ō-oni** (`ooni`): lanza 3 zombis, barrido frontal, salto aplastante y agarre con machaqueo (`SIEGE.held`, `siegeMash`). Se esquiva saltando y recibe ×2,5 de daño por la espalda.
  - **迦楼羅 Karura** (`karura`, tengu-grifo de 4 patas y 4 alas, `KAR`):
    - Ataques: ventarrón, embestida desde el aire, rapto en vuelo y lluvia de plumas.
    - Se le monta con el gancho (`karuraMount`, `P.ride`); se baja con salto, especial o gancho, y el botón pone «⬇ BAJAR».
    - Si se le suben 4, se zarandea, huye y se cura.
    - Los proyectiles solo le dañan desde abajo o por la espalda; los cargados ×0,35.
  - Lógica común en `bossFx()`: `SIEGE.hits`, `siegeAoe`, `siegeGrabStep`, `karuraFx`. Funciona también en el modo normal.
  - **Modo normal:** jefe cada 5 oleadas (5 Ō-oni, 10 Karura, alternando) con `spBoss()`. La oleada no acaba hasta matarlo y suelta botín con `bossLoot`.
- `hurtPlayer(dmg, from)` es el único sitio donde baja la vida del jugador. En el asedio redirige a los bots con `P.mpSwap`.

### Oleadas
- `updateWaves()` y `waveCount(n) = min(220, round(6·1,5^(n−1)))`. En las oleadas de jefe, la mitad.
- `TRAIN` (dojo, sala MP, asedio) desactiva las oleadas, el guardado y el ranking.

### Arsenal y forja (modo normal)
- `RUN.wpn` (2 equipadas), `RUN.bag`, `RUN.slots` (kamon del personaje), `AR` con todos los números ajustables.
- **Fusionar:** arrastrar un arma sobre otra igual llama a `temper` / `fuseInto`. También se puede afilar 🎲 con `sharpen`, usar la forja de sangre 🩸 con `bloodForge` (propia de cada arma, `AR.bloodT`) y fundir.
- **Especial según rareza:** `SPEC_CD`, `SPEC_RAR=[0,1,.45,.3]`, `specOK/specUsed`, `P.spCd`.
  - La común solo hace dash.
  - En Cacería todos tienen el especial (`specFree`).
- **Legendarias:**
  - Solo se mejoran con otra legendaria de su tipo (`legendFeed`): barra `kp` según el poder; al llenarse, +1 hueco `ks`.
  - En los huecos se engarzan kamon (`kam`): +10 % de daño cada uno, más su efecto.

### Multijugador (`NET`)
- PeerJS con el anfitrión como relevo.
- **Cacería (PvP):**
  - Armas en el suelo con menú ✔/✖ sobre el botón especial.
  - Parry que lanza al rival, con 1 s de recarga.
  - Flechas con 0,1 s de retraso, desviables atacando (menos los ataques cargados).
- **Asedio (cooperativo):** de momento solo con 3 bots IA (`SIEGE`, `botStep`, `siegeAI`).
  - Los enemigos atacan al objetivo más cercano.
  - Revivir: estar 1,5 s encima del caído.
  - Armas: se empieza con una al azar. Hay 2 en mano (⇄) y 2 en la bolsa, que solo se usa en la forja del asedio, donde se mejoran con ⛓ metal.
  - La rareza de lo que sale depende de la oleada.
  - Jefe cada 3 oleadas, alternando.

---

## Editor de animaciones (`editor.html`)
- Genera clips de referencia desde el `ATK` del juego (`GEN_V`, `GEN_ATK`) y los guarda en localStorage, en ranuras `arma:tecla`.
- Deslizadores `we` (separación arma–mano) y `wox/woy/woz`. La kusarigama dibuja la cadena hasta el arma.
- La estela del editor sigue la posición del arma.

---

## Cómo probar
- Servidor local: `python3 -m http.server` en la carpeta y abrir `index.html` (o `?bc=1` para multijugador en dos pestañas).
- Las pruebas automáticas se hicieron con Playwright y Chrome: se inyecta `window.__e=x=>eval(x)` antes del último `requestAnimationFrame(frame)` en una copia y se manipula el estado (`startGame()`, `spawnYokai(...)`, `oniRaid(10)`, `siegeStart()`…).
- Para simular un móvil: viewport 412×915 y `Emulation.setCPUThrottlingRate` 4. Resultado de referencia (v1.5, oleada 6 con ~90 zombis): ~52 fps.
- Comprobar la sintaxis extrayendo el `<script>` más largo y pasando `node --check`.

---

## Hoja de cálculo de equilibrio
«Stick Rōnin 3D · Ajustes de equilibrio» (artefacto Sheets de Claude: https://claude.ai/artifact/W6mqzuZSbWiED7KTjNELvC). Tiene estas pestañas:
- **Escalado:** zombis por oleada, golpes, vida de yokai y jefes, incursiones y jefes.
- **Especial:** recargas por rareza.
- **Onis.**
- **Minijefes:** las 16 variantes.
- **Legendarias.**

Si cambias esos números en el juego, actualiza la hoja.

---

## Ideas y pendientes
- **Rendimiento en móvil:** lo que más pesa ahora es dibujar.
  - Siguientes pasos posibles: simplificar los zombis lejanos (menos segmentos) y limitar enemigos visibles.
  - Valorar si dividir `index.html` en varios archivos.
- **Asedio con amigos reales:** ahora solo con bots. Sincronizar enemigos, jefes y armas por PeerJS.
- **Revisión arma por arma:** la kusarigama ya está hecha; siguen las demás.
- **Motor:** se habló de Godot como paso futuro para publicar en tienda. De momento seguir en web.
- Borrar las filas «T» del ranking solo si Daniel lo aprueba.

# Stick Rōnin 3D — contexto del proyecto

Survivor 3D de stickmans con armas japonesas, pensado sobre todo para **móvil (Android)**: oleadas de zombis, yokai y jefes, bendiciones de los kami (Kago) y multijugador.
El desarrollador es Daniel. Escribe en español y juega en Android (a veces en PC). **Responde siempre en español.**

Versión publicada: **v1.6 (26 nov 2026)**, en GitHub Pages: repositorio `Dsmethy-meshed/stick-ronin`, rama `main`.

**Enlaces para el móvil:**
- `main` (lo que ven los jugadores): https://dsmethy-meshed.github.io/stick-ronin/
- `dev` (pruebas): https://raw.githack.com/Dsmethy-meshed/stick-ronin/dev/index.html (tarda unos minutos en actualizarse tras subir)

---

## Reglas de trabajo (acordadas, obligatorias)

1. **Dos ramas en GitHub (acordado el 26 nov 2026):**
   - **`dev`:** se sube cada cambio en cuanto funcione, sin pedir permiso. Es la rama de pruebas.
   - **`main`:** es lo que publica GitHub Pages y ven los jugadores. Solo se fusiona `dev` en `main` cuando Daniel lo aprueba explícitamente.
   - Nunca hacer push forzado a `main`.
   - Subir siempre nombrando la rama (`git push origin dev`). En `.claude/settings.json` (`permissions.ask`) un push a `main`, un `git push` sin rama, `--all`, `--mirror` y `gh pr merge` piden confirmación. Si rsc reescribe ese archivo, comprobar que esas reglas siguen ahí.
2. **El editor de animaciones (`editor.html`) puede estar en GitHub** como copia de seguridad (cambio del 26 nov 2026). Hay que tener en cuenta que en Pages es público por su enlace.
3. **Nada de grabar ni enviar vídeos de gameplay**, salvo que lo pida expresamente.
4. **Cuando cambies algo del juego, aplícalo a todo lo relacionado:** guías, textos de ayuda, menú ℹ Info, descripciones de armas, textos de las bendiciones, notas de versión y hoja de cálculo de equilibrio. No te saltes pasos.
5. **Todas las animaciones de ataque deben poder editarse en el editor.** Sé consecuente: si añades o cambias un ataque, que el editor lo tenga.
6. **Cada vez que publiques en `main`** (en `dev` no hace falta):
   - sube `GAME_VER`, `GAME_DATE` y `GAME_NOTES` en `index.html`;
   - actualiza `version.json` igual. La barra de aviso de actualización solo comprueba en `github.io`.
   - La próxima versión será la 1.7.
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
  - Solo se usa desde `*.github.io` (main). Desde el enlace de pruebas de `dev` o localhost se guarda solo en el dispositivo.
  - Sentry marca el entorno como `github`, `claude` o `dev` según el dominio.
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

### Kago 加護: bendiciones de los kami (modo normal, dojo y asedio, desde el 27 nov 2026)
Sustituye por completo a la forja vieja: ya no hay rarezas de armas, metal, bolsa ni forja en ningún modo. Inspirado en Hades e Isaac; diseño en `reports/Mejoras por sinergias estilo Hades.md` (carpeta principal). Todo el código está en el bloque «KAGO» de `index.html`; los números, en `KG` y en las tablas `KAMI`, `DUO`, `SHINPO`, `TSUCHI`, `RYU`, `KAMON`, `HENGE`, `TATARI`, `ZTYPE`, `WBASE` y `KAI`.
- `kgOn()` = modo normal, dojo o asedio (no Cacería ni sala multijugador, donde todas las armas son iguales y `SM` vale 1). `RUN.kg` guarda la partida; `KS` (lo recalcula `kgCalc` desde `refreshSM`) dice qué está activo.
- **Daño numérico:** 1 unidad = 10 en pantalla. Zombis `KG.zhp(w)=0,6+0,2·(w−1)` (`e.hp`); `kgZHit` (desde `killZombie`) y `kgYDmg` (desde `yokaiHit`) aplican `WBASE` del arma, `SM.dmg` (√ de mejoras × familias), crítico **Kaishin** `KAI` por arma, armadura y estados. `kgDeal` = daño directo sin crítico. `KGPD` fuerza el daño base de los cargados en línea; `KGPJ` pasa el proyectil.
- **Armadura** `e.yr/e.yrMax` (ojo: `e.arm` ya era el largo del brazo del zombi): yoroi-zombi, onis, variantes de minijefe y jefes (vuelve a 66 % y 33 %). Romperla aturde (`kgBreak`).
- **8 kami × 5 ranuras** (`kiri` ataque, `tame` cargado, `waza` especial, `hashiri` dash, `kaeshi` parry) + pasiva por kami (solo si su estado está en una ranura), 12 dúos, 8 Shinpō (3 bendiciones del kami), Omiki (nivel 1-4). Sin rarezas desde el 27 nov 2026: toda bendición vale `KG.base` (×1,5) y solo sube con Omiki (`KG.lvmul`); el campeón 王 y la ofrenda del oni suben niveles.
- Estados por enemigo en `e.ks` (lista `KST`, `kgStep`): shock, quemadura, escarcha/congelado, herida, marca, encanto/aliado, empuje. Zonas en `ZN`, clones `CLONES`, tiradores `TUR`, flechas enemigas `EP`.
- Enganches: `kgSwing` (startAttack), `kgCharge` (soltar carga), `kgDash`, `kgParry` (counterAttack), `kgSpecial` (specUsed), `kgProjMod/kgProjHit` (addProj/updateProj), `kgOnKill` (onKill), `kgSpawnZ/kgSpawnY`, `kgZAI` (IA de yumi-zombi, tanuki y aliados), `kgHurtMod` (hurtPlayer).
- **Flujo:** `startGame` → `kgArmeria` (2 armas + estilo Ryū) → carta inicial de ataque → oleadas. Cada oleada: santuario `hokora` del kami (cada 3, dos). Fin de oleada: `openForge` → `kgEndQueue` (cartas, y en jefes: martillo Tsuchi en 5 y 10, trato del oni si no te tocaron, tienda del tanuki). Pactos de Shinigami (15 % desde la oleada 3).
- **Martillos Tsuchi** (2 por arma) y **estilos Ryū** (1 por arma, se desbloquean venciendo a un jefe con ella; maestría por bajas en `localStorage stickronin_ryu`) cambian cómo funciona el arma **sin animaciones nuevas** (por eso el editor no cambia).
- **Kamon/Henge:** caen de yokai y onis (`LOOT` con `kid`); 3 del mismo juego → Henge (Oni, Tengu, Kitsune, Ryū, Shinobi) con cambio visual (`kgDrawPlayer`).
- **Campeones tatari** (kanji flotante, `kgLabels`) y variantes nuevas: yoroi, yumi, sōhei, kagami, tanuki. Tope de 90 vivos (`KG.cap`).
- Todas las armas tienen especial (`specOK`). Interruptores Temblor/Destellos/Vibración en la armería (`KGFX`).
- La forja vieja se borró del código el 27 nov 2026, también la del asedio: bolsa, huecos, afilar, forja de sangre, fundir, metal ⛓, botín de armas y de jefe, rarezas y legendarias de arma. `genWeapon(type)` solo crea `{uid,kind,type,name}`. De `AR` solo quedan `eff` (efectos que usan los kamon Kago y el dojo) y `maxProj`.
- La armería solo se abre en una partida normal de verdad: `startGame()` la lanza en un microtask y comprueba `!TRAIN`, así que el dojo, la sala MP, el asedio y la prueba de yokai no la ven.

### Multijugador (`NET`)
- PeerJS con el anfitrión como relevo.
- **Cacería (PvP):**
  - Armas en el suelo con menú ✔/✖ sobre el botón especial.
  - Parry que lanza al rival, con 1 s de recarga.
  - Flechas con 0,1 s de retraso, desviables atacando (menos los ataques cargados).
- **Asedio (cooperativo):** de momento solo con 3 bots IA (`SIEGE`, `botStep`, `siegeAI`).
  - Los enemigos atacan al objetivo más cercano.
  - Revivir: estar 1,5 s encima del caído.
  - Armas: se empieza con una al azar y una bendición. 2 en mano (⇄); las del suelo se equipan con ✔ o se dejan con ✖.
  - Mejoras: bendiciones Kago (`openForge` al acabar cada oleada y santuarios ⛩). Sin martillo, trato del oni ni tienda. Zombis con ×`KG.siegeHp` de vida; los golpes de los bots hacen daño fijo (`kgAbs`, mata en `KG.botHits` golpes) y no activan tus bendiciones.
  - Jefe cada 3 oleadas, alternando.

---

## Editor de animaciones (`editor.html`)
- Genera clips de referencia desde el `ATK` del juego (`GEN_V`, `GEN_ATK`) y los guarda en localStorage, en ranuras `arma:tecla`.
- Deslizadores `we` (separación arma–mano) y `wox/woy/woz`. La kusarigama dibuja la cadena hasta el arma.
- La estela del editor sigue la posición del arma.

---

## Herramientas del proyecto (Claude Code)
- **Harness rsc** (`.rsc.json`, `02-DOCS/`): carriles Answer / FTD / ASDD, skills de flujo y de juego (`game-design`, `level-design`, `gamedev-multiplayer`, `performance`…).
- **Skills de terceros** en `.claude/skills/`, con origen, commit y licencia en `.claude/skills-terceros.md`:
  - game feel: `juice-scan`, `juice-apply`, `juice-principles`, `game-feel`;
  - menús y HUD: `game-ui-ux`, `threejs-game-ui-designer`;
  - VFX y animación: `particle-system`, `shader-glsl`, `threejs-animation`, `threejs-shaders`, `threejs-postprocessing`, `threejs-aaa-graphics-builder`;
  - rendimiento: `threejs-performance`, `threejs-debug-profiler`;
  - escalado RPG: `rpg`, `roguelike`, `balance-check`, `procedural-gen`;
  - otras: `camera-systems`, `audio-design`.
  - Están escritas pensando en Three.js moderno; el juego usa **r128**, así que hay que comprobar que la API exista en r128 antes de usar lo que proponen.
- **MCP `threejs-devtools`** (`.mcp.json`): inspecciona la escena en vivo. Necesita el servidor local en el puerto 8000.
- **Servidor local:** configuración `juego-local` en `.claude/launch.json` (puerto 8000).

## Cómo probar
- Servidor local: `python -m http.server 8000` en la carpeta (o `juego-local` desde el panel del navegador) y abrir `index.html` (o `?bc=1` para multijugador en dos pestañas).
- Las pruebas automáticas se hicieron con Playwright y Chrome: se inyecta `window.__e=x=>eval(x)` antes del último `requestAnimationFrame(frame)` en una copia y se manipula el estado (`startGame()`, `spawnYokai(...)`, `oniRaid(10)`, `siegeStart()`…).
- Para simular un móvil: viewport 412×915 y `Emulation.setCPUThrottlingRate` 4. Resultado de referencia (v1.5, oleada 6 con ~90 zombis): ~52 fps.
- Comprobar la sintaxis extrayendo el `<script>` más largo y pasando `node --check`.

---

## Hoja de cálculo de equilibrio
«Stick Rōnin 3D · Ajustes de equilibrio» (artefacto Sheets de Claude: https://claude.ai/artifact/W6mqzuZSbWiED7KTjNELvC). Tiene estas pestañas:
- **Escalado:** zombis por oleada, golpes, vida de yokai y jefes, incursiones y jefes.
- **Especial:** recargas por rareza (ya no se usa: desde el 27 nov 2026 no hay rarezas de arma).
- **Onis.**
- **Minijefes:** las 16 variantes.
- **Legendarias.** (de la forja vieja; ya no se usa en ningún modo)
- **Kago:** reglas y números del sistema de bendiciones.
- **Armas:** dificultad, daño base, Kaishin, martillos y estilo de cada arma.
- **Kami:** estado, las 5 ranuras, pasiva y Shinpō de cada kami.
- **Enemigos:** variantes nuevas de zombi y campeones tatari.
- En «Escalado», columnas K-M: vida de zombi Kago, golpes de katana sin mejoras y probabilidad de campeón.

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

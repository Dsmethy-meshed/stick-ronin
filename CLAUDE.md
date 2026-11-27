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
   - Blanco, negro y rojo (tinta japonesa): guía, paleta, técnicas por coste y enlaces en `02-DOCS/wiki/arte/estilo-visual.md`. Decidido el 27 nov 2026: mejorar el juego actual en Three.js r128, sin rehacerlo ni migrar.
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
| `models/` | Modelos 3D (desde el 27 nov 2026): `zombie.glb` (zombi samurái de Tripo, una malla de 1500 triángulos sin textura; cada vértice guarda en su color sus 2 tramos y la proporción), `zombie_rig.json` (12 puntos de reposo y raíces de brazos/piernas), `zmodel.js` (código compartido por juego y editor), `src/` (GLB original de Tripo) y `tools/prep_tripo.py` (script de Blender para preparar más modelos). |

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
- Gancho a Amanojaku/Kurage (28 nov 2026): si el objetivo muere o desaparece mientras el gancho vuela, se suelta (`updateHook`); antes `P.grap` se quedaba lanzándose y te bloqueaba. Ningún lanzamiento dura más de 1 s.
- **天邪鬼 Amanojaku** (`amanojaku`, `AMJ`, `amjTick`, `spawnAmanojaku`): desde la oleada 3 aparece en azoteas (`amjRoofs`, prefiere tejados desde los que te ve, `losIgn`), dispara flechas con caída (`EP` con `vy`) y, si te acercas, se va con su gancho a otro tejado. Si dos veces no te ve, también cambia de tejado. Tu gancho lo apunta (`findHook`) y al alcanzarlo muere (`amjHooked`). Cuenta como `spider:true` (no bloquea el fin de oleada). Botón en el dojo.
- **Veneno 毒** (`PSN`, `psApply`, `psTick`, `psDraw`): quita `P.psD`/s durante `P.psT`, frena ×0,85 (`hbSlow`), bordes verdes en pantalla (`#psFx`). Charcos tóxicos `EZ` (`psPuddle`); el dash los cruza sin envenenarte. Escupitajos/gotas son `EP` con `g` y `poison` (`psSpit`, `psDrop`): al caer dejan charco.
- **濡れ女 Nure-onna** (`nureonna`, desde la oleada 4): mujer serpiente que guarda 4,5-8 m, escupe veneno en arco y de cerca muerde (10 + veneno). **海月火 Kurage-hi** (`kurage`, desde la 5, en grupos de 2-3, 3 desde la 9): flotan a 3 m, sueltan gotas tóxicas y al morir dejan una nube (veneno si estás a menos de 2,8 m); tu gancho las tumba. Salen con `ykWaveSpawn`. Botones en el dojo.
- `hurtPlayer(dmg, from)` es el único sitio donde baja la vida del jugador. En el asedio redirige a los bots con `P.mpSwap`.

### Oleadas
- `updateWaves()` y `waveCount(n) = min(220, round(6·1,5^(n−1)))`. En las oleadas de jefe, la mitad.
- `TRAIN` (dojo, sala MP, asedio) desactiva las oleadas, el guardado y el ranking.

### Kago 加護: bendiciones de los kami (modo normal, dojo y asedio, desde el 27 nov 2026)
Sustituye por completo a la forja vieja: ya no hay rarezas de armas, metal, bolsa ni forja en ningún modo. Inspirado en Hades e Isaac; diseño en `reports/Mejoras por sinergias estilo Hades.md` (carpeta principal). Todo el código está en el bloque «KAGO» de `index.html`; los números, en `KG` y en las tablas `KAMI`, `DUO`, `SHINPO`, `TSUCHI`, `RYU`, `KAMON`, `HENGE`, `TATARI`, `ZTYPE`, `WBASE` y `KAI`.
- `kgOn()` = modo normal, dojo o asedio (no Cacería ni sala multijugador, donde todas las armas son iguales y `SM` vale 1). `RUN.kg` guarda la partida; `KS` (lo recalcula `kgCalc` desde `refreshSM`) dice qué está activo.
- **Daño numérico:** 1 unidad = 10 en pantalla. Zombis `KG.zhp(w)=(0,6+0,25·(w−1))·1,07^(w−1)` (6, 21, 52 y 193 en pantalla en las oleadas 1, 5, 10 y 20; `e.hp`); yokai ×(1+0,15·(w−1))·1,04^(w−1) y jefes ×(1+0,1·(w−1))·1,04^(w−1) (`KG.ykExp`). Daño recibido +`KG.edmg` 5 % por oleada; curación al superar oleada `KG.waveHeal` 15. Omiki más flojo (`KG.lvmul` ×1 / 1,3 / 1,55 / 1,75) y más raro en las cartas. **Tienda rotativa** (`SHOP`, `shopRoll`, `KGH.sBuy`): cada visita 4 objetos de 9 (Omiki solo en el 35 % de las visitas), cada uno 1 vez; 2 compras por visita y 6 por partida; el 15 % de las visitas el «tanuki generoso» deja 3 y sube el tope a 7. Bonos de tienda en `RUN.kg.hpB`, `dmgB`, `pdB` (los aplica `kgCalc`/`kgPerfect`). Bendiciones `KG.base` ×1,3; esquiva perfecta ×2 con 1,5 s de recarga; `KGPJ` pasa el proyectil.
- **Armadura** `e.yr/e.yrMax` (ojo: `e.arm` ya era el largo del brazo del zombi): yoroi-zombi, onis, variantes de minijefe y jefes (vuelve a 66 % y 33 %). Romperla aturde (`kgBreak`).
- **8 kami × 5 ranuras** (`kiri` ataque, `tame` cargado, `waza` especial, `hashiri` dash, `kaeshi` parry) + pasiva por kami (solo si su estado está en una ranura), 12 dúos, 8 Shinpō (3 bendiciones del kami), Omiki (nivel 1-4). Sin rarezas desde el 27 nov 2026: toda bendición vale `KG.base` (×1,5) y solo sube con Omiki (`KG.lvmul`); el campeón 王 y la ofrenda del oni suben niveles.
- Estados por enemigo en `e.ks` (lista `KST`, `kgStep`): shock, quemadura, escarcha/congelado, herida, marca, encanto/aliado, empuje. Zonas en `ZN`, clones `CLONES`, tiradores `TUR`, flechas enemigas `EP`.
- Enganches: `kgSwing` (startAttack), `kgCharge` (soltar carga), `kgDash`, `kgParry` (counterAttack), `kgSpecial` (specUsed), `kgProjMod/kgProjHit` (addProj/updateProj), `kgOnKill` (onKill), `kgSpawnZ/kgSpawnY`, `kgZAI` (IA de yumi-zombi, tanuki y aliados), `kgHurtMod` (hurtPlayer).
- **Flujo:** `startGame` → `kgArmeria` (2 armas + estilo Ryū) → carta inicial de ataque → oleadas. Cada oleada: santuario `hokora` del kami (cada 3, dos). Fin de oleada: `openForge` → `kgEndQueue` (cartas, y en jefes: martillo Tsuchi en 5 y 10, trato del oni si no te tocaron, tienda del tanuki). Pactos de Shinigami (15 % desde la oleada 3).
- **Martillos Tsuchi** (2 por arma) y **estilos Ryū** (1 por arma, se desbloquean venciendo a un jefe con ella; maestría por bajas en `localStorage stickronin_ryu`) cambian cómo funciona el arma **sin animaciones nuevas** (por eso el editor no cambia).
- **Kamon/Henge:** caen de yokai y onis (`LOOT` con `kid`); 3 del mismo juego → Henge (Oni, Tengu, Kitsune, Ryū, Shinobi) con cambio visual (`kgDrawPlayer`).
- **Campeones tatari** (kanji flotante, `kgLabels`) y variantes nuevas: yoroi, yumi, sōhei, kagami, tanuki. Tope de 90 vivos (`KG.cap`).
- Efectos visibles (27 nov 2026): lotes sin luz `GLS`/`GLP` (`gl`, `gp`). `kgStatusFx` dibuja cada estado (llamas, bloque de hielo, chispas, aura de herida, luna, corazones, viento); `kgZoneFx` las zonas; `kgArc` rayos en zigzag, `kgWave` ondas, `KTRAIL` estela del dash; el arma brilla con el kami de la ranura de ataque. Todo en `kgVfxDraw`, llamado desde `kgDrawFx`.
- Especial (`waza`) y dash (`hashiri`) son poderes del kami: p. ej. Raijin hace caer 5 rayos y su dash es un relámpago; Kagutsuchi estalla y deja un anillo de fuego; Yuki-onna congela todo en 3,5 m; Inari suelta 3 fuegos de zorro.
- Sin parry en normal, dojo ni asedio (27 nov 2026): atacar ya no abre ventana de parry. En su lugar, **esquiva perfecta 避** (`kgPerfect`, desde `hurtPlayer`): si te iban a golpear durante el dash o hasta `KG.pdWin` 0,35 s desde que empezó (×`SM.par`), cámara lenta, aturde al atacante, el siguiente golpe es crítico ×`KG.pdMul` 2,5 y se activa la ranura 返 (ahora «Esquiva perfecta», `kgParry`). Recarga `KG.pdCd` 1,2 s.
- Todas las armas tienen especial (`specOK`). Interruptores Temblor/Destellos/Vibración/Números de daño en la armería (`KGFX`, guardados en `stickronin_fx`). Los números de daño vienen encendidos fuera de `github.io` (dev, githack, local) y apagados por defecto en la web oficial; no hay que tocar nada al fusionar en `main`.
- La forja vieja se borró del código el 27 nov 2026, también la del asedio: bolsa, huecos, afilar, forja de sangre, fundir, metal ⛓, botín de armas y de jefe, rarezas y legendarias de arma. `genWeapon(type)` solo crea `{uid,kind,type,name}`. De `AR` solo quedan `eff` (efectos que usan los kamon Kago y el dojo) y `maxProj`.
- La armería solo se abre en una partida normal de verdad: `startGame()` la lanza en un microtask y comprueba `!TRAIN`, así que el dojo, la sala MP, el asedio y la prueba de yokai no la ven.

### Multijugador (`NET`)
- PeerJS con el anfitrión como relevo.
- **Cacería (PvP):**
  - Armas en el suelo con menú ✔/✖ sobre el botón especial. Desde el 27 nov 2026 traen bendiciones (`item.bl=[{ka,lv}]`, `huntBless`): por cuartos de partida 1·2·2·3 bendiciones de nivel 1·2·3·4 (tabla `HB`). El atacante manda `bl` en el mensaje `hit` (`hbAttack`: +5 % de daño por nivel, crítico lunar, robo de vida de Inari); el golpeado se aplica los estados en su móvil (`hbHit`/`hbTick`: quemadura, lentitud, rayo, herida, controles al revés, empuje). Los estados viajan en `st.fx` y el brillo del arma en `st.bk` (`hbDraw`). Una sola arma: solo se coge al empezar y tras reaparecer (`NET.canPick`); vivo te quedas con ella (menú 🔒, ⇄ desactivado en la Cacería).
  - Parry que lanza al rival, con 1 s de recarga. Anti-machaque (27 nov 2026): ventana `HUNT.win` 0,18 s; si vuelves a pulsar antes de `HUNT.mash` (0,35 s) solo `HUNT.mashWin` 0,05 s; si la ventana se acaba sin parar nada, `P.parryLock` 0,45 s sin poder intentarlo. Solo fuera de Kago (`!kgOn()`).
  - Flechas con 0,1 s de retraso, desviables atacando (menos los ataques cargados).
- **Asedio (cooperativo):** de momento solo con 3 bots IA (`SIEGE`, `botStep`, `siegeAI`).
  - Los enemigos atacan al objetivo más cercano.
  - Revivir: estar 1,5 s encima del caído.
  - Armas: se empieza con una al azar y una bendición. 2 en mano (⇄); las del suelo se equipan con ✔ o se dejan con ✖.
  - Mejoras: bendiciones Kago (`openForge` al acabar cada oleada y santuarios ⛩). Sin martillo, trato del oni ni tienda. Zombis con ×`KG.siegeHp` de vida; los golpes de los bots hacen daño fijo (`kgAbs`, mata en `KG.botHits` golpes) y no activan tus bendiciones.
  - Jefe cada 3 oleadas, alternando.

---

## Modelos 3D (`models/`)
- **Deformación en la tarjeta gráfica, sin esqueleto de three.js** (27 nov 2026; el esqueleto costaba ~8-10 fps y las piezas rígidas dejaban costuras). Una sola malla; cada vértice tiene sus 2 tramos de `BONES` y la proporción (`zmSeg`). Cada fotograma `ZM.add(J,yaw,s,vis,col)` calcula 11 matrices por cuerpo (cada una pegada a `J[a]→J[b]`, con estirado; hombros y caderas pegados al tramo padre) y las escribe en una `DataTexture` (fila = cuerpo, 4 texels por tramo). Un shader (`onBeforeCompile` sobre Lambert) mezcla las dos matrices de cada vértice: articulaciones suaves.
- Todos los cuerpos en UNA llamada de dibujo (`InstancedMesh`, atributo `zmBody`, tope `ZM.cap` 120). Color por cuerpo con `instanceColor` (`e.col`, `r.col`, `C.col`; estados con `kgTint`).
- Cortes sin tocar la malla: un tramo cortado guarda su punto de unión con `[3][3]=0`; en el shader, el vértice que es sobre todo de ese tramo se encoge ahí y el resto se queda entero con el tramo unido (corte limpio). Vivos, ragdolls (`rags`, `frags`) y cadáveres (`CORPSES`). Los muñones rojos se siguen dibujando.
- **Varios modelos (28 nov 2026):** `zmodel.js` es una fábrica (`mkZM`): `window.ZM` (zombis, 120 cuerpos, color por cuerpo) y `window.ZMP` (protagonista, 8 cuerpos, con su textura). El protagonista (`models/player.glb`, rig de Mixamo, 2600 triángulos, textura 512) lo dibuja `ZMP.add(J,P.ryaw,…)` en vez de `drawChar`, también su ragdoll al morir; interruptor «🥷 Protagonista 3D» (`KGFX.pmodel`, encendido fuera de `github.io`). La bufanda y las armas siguen siendo las del juego. En el estilo tinta se pinta como **guerrero en tinta aguada** (`ZM_WASH` en el shader: la textura pasa a papel/tinta por su luminosidad, grano de pincel con ruido, borde de la silueta como pincelada seca y el rojo del fajín conservado por su tono).
- `ZM.begin/add/end` en `draw()`. Interruptor «🧟 Modelos 3D» (`KGFX.model`, encendido por defecto); si el GLB no carga (p. ej. abriendo como archivo) se dibujan palos.
- Rendimiento (CPU ×4, oleada 6): ~43 fps con 64 modelos, igual que con palos.
- **Ceniza al morir** (`ASH`, `ashK`, `ashPuff`, `ashRise`; rehecho el 27 nov 2026 inspirado en el disuelto de Codrops y en three.quarks): los cuerpos (ragdolls con `r.ash` y cadáveres partidos) caen ~0,75 s y entre 0,75 y 1,3 s **arden**: el shader del modelo (`zmDis` por instancia, 6.º parámetro de `ZM.add`) quita la malla con ruido 3D de la cabeza a los pies, con una franja incandescente blanco-amarillo → naranja y carbón detrás. Brasas aditivas con halo (`embers`, `addE`, tope `EMM` 520; suben, se mecen y se enfrían) salen por el frente de fuego (`ashJoint`) y copos oscuros (`k:'f'`) flotan. A 1,3 s desaparecen y los de zombi normal se convierten en 2 minis (`GORE.CONVERT_T`), que brotan con `ashRise` (sin humo gris). Con palos, el cuerpo se oscurece y encoge (`ashCol`). Rendimiento igual (CPU ×4, oleada 6: ~46 fps).
- Cuerpos caídos: la dirección (`r.yaw`, `C.yaw`) se fija al morir (la del zombi) y no se recalcula cada fotograma; recalcularla por las rodillas hacía girar 180° el cuerpo y retorcía la malla.
- Ojo r128: los colores de vértice normalizados de 16 bits no se convierten solos (se dividen entre 65535 al cargar).
- Nuevos modelos de Tripo: Blender 5.2 + `models/tools/prep_tripo.py entrada.glb salida.glb salida_rig.json [triángulos] [tex]` (vale para rigs de Tripo y de Mixamo; `tex` conserva la textura a 512 px) (baja triángulos, quita texturas, guarda los tramos de cada vértice según los pesos del rig de Tripo y exporta la malla + el JSON).

## Estilo tinta 墨 (27 nov 2026)
- **Todos los números del estilo en `models/inkstyle.js`** (`INKS.DEF` con clave, grupo, etiqueta, tipo, valor, rango; valores `INKS.v`, uniforms compartidos `INKS.u`; guarda en localStorage `stickronin_ink` solo lo que difiere del valor por defecto y avisa a otras pestañas). Se ajustan con deslizadores en el editor (pestaña «🖌 Shader»); para dejarlos fijos para todos, copiar el JSON del editor en los valores por defecto de `inkstyle.js`.
- Bloque «ESTILO TINTA» de `index.html` (`inkApply`, `inkPatch`, `inkScan`, `inkTone`, `INK_B`; lee `INKS`); guía en `02-DOCS/wiki/arte/estilo-visual.md`. Interruptor «🖌 Estilo tinta» (`KGFX.ink`): encendido por defecto fuera de `github.io` (dev, local) y apagado en la web oficial, como los números de daño.
- Paleta de papel (niebla `#e8e1d4`, suelo hueso, edificios en tinta, pagodas en aguada, sol rojo `#c8102e`); al apagar se restauran los colores de `INK.orig`.
- Sombreado en 3 tonos en **todos** los `MeshLambertMaterial` (`inkPatch` envuelve su `onBeforeCompile` y conserva su `customProgramCacheKey`; el uniform `INK.on` es compartido, así que encender/apagar no recompila). `inkScan` repasa la escena cada 90 fotogramas para los materiales nuevos.
- Contorno de tinta con «casco invertido»: `INK_B` reutiliza la geometría de los lotes `SEG, SPH, ZB_SEG, ZB_SPH, SEGL, SPHL` (0 CPU, 1 llamada por lote); ojo, `bSeg` monta los cilindros en espejo y por eso los segmentos usan `INKOUT_S` (FrontSide). El modelo tiene `ZM.outline` (mismo parche, inflado `ZM.inkU`, respeta cortes y ceniza). Sin contornos en calidad 0.
- Enemigos en tinta (`inkTone`) y sin brillo propio del modelo; el rojo queda para el jugador, la sangre, los ojos y el peligro; los colores de los kami solo en los brillos (decidido con Daniel).
- Rendimiento (CPU ×4, oleada 6, calidad 2): 43,7 fps con tinta y 120 modelos frente a 46,2 sin tinta.

## Editor de animaciones (`editor.html`)
- Genera clips de referencia desde el `ATK` del juego (`GEN_V`, `GEN_ATK`) y los guarda en localStorage, en ranuras `arma:tecla`.
- Deslizadores `we` (separación arma–mano) y `wox/woy/woz`. La kusarigama dibuja la cadena hasta el arma.
- La estela del editor sigue la posición del arma.
- Botones «🧟 Modelo zombi» y «🥷 Modelo protagonista» (ver el modelo en vez de los palos; `zmKind`). Necesita abrirse desde un servidor para cargar el GLB.
- **Pestaña «🖌 Shader»** (editor de shaders, 28 nov 2026): un deslizador, color o interruptor por cada ajuste de `INKS` (paleta, luz, tonos, contorno, enemigos, protagonista, ceniza), vista previa del estilo tinta con el protagonista, el zombi o los palos, «🔥 Probar ceniza» en bucle, copiar/pegar ajustes en JSON y valores por defecto. Lo ajustado se guarda en el dispositivo y el juego del mismo sitio lo usa al momento.

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

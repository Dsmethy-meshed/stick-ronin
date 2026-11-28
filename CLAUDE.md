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
| `editor.html` | Editor de animaciones por fotogramas clave. Está también en GitHub como copia. Su menú enlaza a las dos herramientas siguientes. |
| `shaders.html` | Banco de pruebas del estilo tinta (28 nov 2026): escena como la del juego y todos los ajustes de `models/inkstyle.js` por grupos plegables. |
| `modelo.html` | Taller de modelos (28 nov 2026): pintar pesos (a qué tramo pertenece cada vértice) y ajustar el esqueleto de referencia, la escala y el estiramiento de cada modelo. |
| `README.md` | README público corto. |
| `models/` | Modelos 3D (desde el 27 nov 2026): `zombie.glb` (zombi samurái de Tripo, una malla de 1500 triángulos sin textura; cada vértice guarda en su color sus 2 tramos y la proporción), `zombie_lod1.glb`/`zombie_lod2.glb` (LOD de 800 y 500 triángulos), `zombie_rig.json` (12 puntos de reposo y raíces de brazos/piernas), `zmodel.js` (código compartido por juego y editor), `src/` (GLB original de Tripo) y `tools/prep_tripo.py` (script de Blender para preparar más modelos). |

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
- **Armas `WT`** (12): katana, maza (kanabō), nito, odachi, naginata, tekko, kusarigama, ofuda, kama, tanegashima, yumi y shuriken. **Yari y tessen se quitaron el 28 nov 2026** (se jugaban igual que otras); las partidas guardadas los cambian a tekko/ofuda (`WMIG` en `savedRun`).
- **Tekkō 鉄甲** (puños, `blunt`): combo `p1`-`p4` (directo, cruzado, gancho y uppercut con `up` que lanza con `launchZombie`; Kaishin ×2,5 a enemigos en el aire), cargado = puñetazo al suelo (`mc`, `slam`), especial **AGARRE** (`grab`: `grabStart`/`grabStep`/`thrownStep`, `GRAB`): coge un zombi, lo levanta y lo lanza hacia donde hay más enemigos; golpea a los que cruza y estalla al caer. Martillos Tetsu-ken y Nage-waza; estilo Te.
- **Ofuda 札** (talismanes, `tap:'ofuda'`): toques 1·1·3 en abanico de talismanes que buscan (`home`) y estallan (`boomR` 1,4) con la bendición de ataque; cargado = sello en el suelo (`aimRel:'ward'`) que estalla tras 0,45 s; especial GRULLA (el planeo `glide` que tenía el tessen). Kaishin ×2 a enemigos con estado de kami. Martillos Bakufu y Renju; estilo Abe-ryū.
  - Cada una tiene `special` y, algunas, `tap`.
  - Nombres de los especiales en `SPN`.
- **Equilibrio de armas (28 nov 2026, `02-DOCS/wiki/ftd/armas-equilibrio.md`):** daño base `WBASE` katana 1,2, kanabō 2,4, nitō 0,75, kama 0,95, tekko 1, ofuda 1. Katana: radio de golpe 0,3 y corte de viento en el 3.er golpe (clips `BUILTIN_V` u2). La kama `c4` es un giro (`spin`; editor `GEN_V` g7). Shuriken 1,3 y abanico de 5; tanegashima recarga 0,75 s y bala que estalla (`boomR` 1,3, `boomD` 1); flechas del yumi 1,2.
- **Tanegashima (28 nov 2026, `GUN`):** autoapuntado con diana como el yumi (`bowUpdTarget` también con `tap:'bullet'`). Saltar = disparar al suelo (`gunJump`): 3 veces antes de tocar suelo (4 con Inari en 斬), área 2,2 m con daño 1,5 por `procKill` directo (cuenta como golpe normal: aplica la bendición de 斬) y extra por kami (rayo, charco de fuego, escarcha, marca al 3.º, pétalos, área ×1,4 con Fūjin, ×1,3 con Hachiman). Especial DESCARGA: 7 perdigones de 3,5, onda en cono de 4,5 m y retroceso de 24 durante 0,3 s con salto. **Guía de lanzamiento** (`SPAIM`, `spGuide`, `spAimStep`, `SPDRAG`): mantener el especial muestra cono rojo y flecha del retroceso; arrastrar el dedo sobre el botón apunta; soltar lo lanza. Pensado para extenderlo a otros especiales (añadir su forma a `SPAIM`).
- Puntería: sin joystick y sin nadie en el cono, `aimDir` y `startAttack` apuntan al más cercano en cualquier dirección. Los proyectiles dan a los minis (altura mínima 1,3 m) y no pasan por el filtro de 0,09 s de `kgZHit`.

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
- **Director de eventos `EV` (28 nov 2026, a petición de Daniel):** entre dos eventos grandes (yokai, incursión, Amanojaku) pasan al menos `EV.gap` 14 s, el primero no antes de 10 s tras empezar la oleada, y ninguno sale con el jefe vivo (`evReady`, `evBoss`). Incursiones: nunca en oleada de jefe, a los 25-45 s, probabilidad `EV.raidP` (0,25 + 0,05·oleada, tope 0,7). **Amanojaku raro:** 1 como mucho, nunca en dos oleadas seguidas; se comprueba cada 5-8 s con probabilidad `AMJ.p(G.lowT)` que sube con el tiempo que pasas abajo (`G.lowT`, baja ×4 en las azoteas, por encima de `AMJ.high` 1,8 m). Antes, en la oleada 5 salían jefe, Amanojaku e incursión en 13 s.
- `hurtPlayer(dmg, from)` es el único sitio donde baja la vida del jugador. En el asedio redirige a los bots con `P.mpSwap`.

### Oleadas
- `updateWaves()` y `waveCount(n) = min(220, round(6·1,5^(n−1)))`. En las oleadas de jefe, la mitad.
- `TRAIN` (dojo, sala MP, asedio) desactiva las oleadas, el guardado y el ranking.

### Kago 加護: bendiciones de los kami (modo normal, dojo y asedio, desde el 27 nov 2026)
Sustituye por completo a la forja vieja: ya no hay rarezas de armas, metal, bolsa ni forja en ningún modo. Inspirado en Hades e Isaac; diseño en `reports/Mejoras por sinergias estilo Hades.md` (carpeta principal). Todo el código está en el bloque «KAGO» de `index.html`; los números, en `KG` y en las tablas `KAMI`, `DUO`, `SHINPO`, `TSUCHI`, `RYU`, `KAMON`, `HENGE`, `TATARI`, `ZTYPE`, `WBASE` y `KAI`.
- `kgOn()` = modo normal, dojo o asedio (no Cacería ni sala multijugador, donde todas las armas son iguales y `SM` vale 1). `RUN.kg` guarda la partida; `KS` (lo recalcula `kgCalc` desde `refreshSM`) dice qué está activo.
- **Daño numérico:** 1 unidad = 10 en pantalla. Zombis `KG.zhp(w)=(0,6+0,25·(w−1))·1,07^(w−1)` (6, 21, 52 y 193 en pantalla en las oleadas 1, 5, 10 y 20; `e.hp`); yokai ×(1+0,15·(w−1))·1,04^(w−1) y jefes ×(1+0,1·(w−1))·1,04^(w−1) (`KG.ykExp`). Daño recibido +`KG.edmg` 5 % por oleada; curación al superar oleada `KG.waveHeal` 15. Omiki más flojo (`KG.lvmul` ×1 / 1,3 / 1,55 / 1,75) y más raro en las cartas. **Tienda rotativa** (`SHOP`, `shopRoll`, `KGH.sBuy`): cada visita 4 objetos de 9 (Omiki solo en el 35 % de las visitas), cada uno 1 vez; 2 compras por visita y 6 por partida; el 15 % de las visitas el «tanuki generoso» deja 3 y sube el tope a 7. Bonos de tienda en `RUN.kg.hpB`, `dmgB`, `pdB` (los aplica `kgCalc`/`kgPerfect`). Bendiciones `KG.base` ×1,3; esquiva perfecta ×2 con 1,5 s de recarga; `KGPJ` pasa el proyectil.
- **Armadura** `e.yr/e.yrMax` (ojo: `e.arm` ya era el largo del brazo del zombi): yoroi-zombi, onis, variantes de minijefe y jefes (vuelve a 66 % y 33 %). Romperla aturde (`kgBreak`).
- **Orbe del kami** (`KG.orb`): 8 % al matar un minijefe con variante, 1 por oleada como mucho; abre 2 cartas de ese kami en mitad de la oleada.
- Cartas: nunca ofrecen la bendición que ya ocupa esa ranura; cambiar la de ataque (斬) ya puesta es muy raro (`KG.kiriSwap`, ~5 % de las tandas).
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
- **Forja sencilla 鍛 (28 nov 2026, vuelve a petición de Daniel, bloque «FORJA» de `index.html`, números en `FJ`):** cada arma tiene rareza `rar` (Común/Rara/Épica/Legendaria, daño ×1/1,15/1,3/1,5) y afilado `afi` (0 Mala −15 %, 1 Normal, 2 Buena +10 %, 3 Afilada +20 %, 4 Letal +35 %, 5 Terrorífica = `tx` una stat +60 % y otra −30 %, 6 Divina +50 % y +20 % al resto); lo aplica `fjApply` tras `kgCalc`. **Fusión al recoger** (`fjPickWeapon`, como la forja antigua): cada arma igual que recoges suma progreso `fp` hacia la siguiente rareza según lo cerca que esté de la tuya (`FJ.fuse`: misma 100 %, una menos 50 %, dos 25 %, tres 12 %); mejor rareza → la sustituye; con legendaria se funde en tama. **Armas de otro tipo** (vuelven los cambios de arma a media partida): al pisarlas sale el menú `#fjPick` (`fjNear`/`fjPickAct`): ⇄ cambiar por la de tu mano (la tuya queda en el suelo con su rareza y afilado), 魂 vender (`FJ.sell` 4+6·rareza), ⛓ fundir en acero (`FJ.steelOf` 1+rareza) o ✖ dejarla. **Acero** (`RUN.kg.steel`): en 研 AFILAR, «Templar» gasta 1 y sube la barra de rareza poco y cada vez menos (`FJ.steelGain` = 0,22/((1+rareza)·(1+0,1·(oleada−1))): común 22 % en la oleada 1, 12 % en la 10; épica 7 % → 4 %). Botín (`fjOnKill`): minijefes con variante 30 % piedra y 15 % arma, yokai 20 %, onis 30 %, zombis 1 %, jefes arma rara+ y toishi; 40 % de tus tipos y el resto de cualquiera; como mucho 6 armas en el suelo. **Piedras** (`RUN.kg.stones`, `FJ.st`): arenisca (hasta Buena, 70 %), toishi (hasta Letal, 50 %, 2 % Divina), extraña (Afilada con efecto bueno/malo `odd` o Terrorífica); **de los kami** (50 % sube un nivel, 50 % lo baja, sin pasar por Terrorífica; desde Letal sube a Divina); +10 % tras cada fallo (`pity`), 25 % de que no se gaste; también en la tienda. **Menas** (`MENAS`, `menaSpawn` al empezar cada oleada, 2-3, 3 golpes/dash/proyectil, sueltan su piedra). Pantalla **研 AFILAR** (`fjForge`/`fjRender`/`fjAnvil`, CSS `.fj*`) en `kgEndQueue` tras las cartas si tienes piedras o acero: pestañas de tus 2 armas, el arma grande sobre un «yunque» con el brillo de su rareza, bandeja de piedras que se **arrastran con el dedo a la hoja** (`fjBindDrag`, fantasma `.fjghost`) o se tocan y luego la hoja; al afilar, la piedra pasa por el filo, chispas y el kanji cae como sello (`FJANIM`: up/down/fail/div/terr/steel/rar); el acero es un martillazo. En horizontal (alto < 520 px) se compacta. Tarjeta del arma del suelo `.fjp`: entra con rebote, brillo de rareza, compara el daño con tu arma, 3 botones grandes (⇄/魂/⛓) y ✖; abajo en el centro en horizontal y arriba en vertical (para no tapar los botones de combate). El orbe del kami da un regalo de la tienda el 35 % de las veces (`KG.orb.shop`). Solo con Kago (no Cacería ni asedio).
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
- **Varios modelos (28 nov 2026):** `zmodel.js` es una fábrica (`mkZM`): `window.ZM` (zombis, 120 cuerpos, color por cuerpo) y `window.ZMP` (protagonista, 8 cuerpos, con su textura). El protagonista (`models/player.glb`, rig de Mixamo, 3200 triángulos con las manos protegidas, textura 512) lo dibuja `ZMP.add(J,P.ryaw,…)` en vez de `drawChar`, también su ragdoll al morir; interruptor «🥷 Protagonista 3D» (`KGFX.pmodel`, encendido fuera de `github.io`). Las armas siguen siendo las del juego; la bufanda usa la misma física (`scarf`) pero con el modelo se dibuja como tira de tela plana (`RIB`, `drawRibbon`: 3 vértices por punto, más ancha en el cuello, cola en «V», bordes en rojo oscuro y aleteo). En el estilo tinta se pinta como **guerrero en tinta aguada** (`ZM_WASH` en el shader: la textura pasa a papel/tinta por su luminosidad, grano de pincel con ruido, borde de la silueta como pincelada seca y el rojo del fajín conservado por su tono).
- **LOD del zombi (28 nov 2026):** `zombie_lod1.glb` (800 triángulos) y `zombie_lod2.glb` (500). Salen de un remesh de Tripo (Retopología, modo Triángulo) de una copia sin rig del zombi samurái (Tripo no deja retopologizar un modelo con rig: «Rigged models don't support retopology yet»; se guardó la versión anterior del historial como activo nuevo, 5 créditos cada remesh; pidiendo 800 dio 1391 y 500 dio 568; los dos se bajaron en Blender a 800 y 500). Fuentes en `models/src/zombie_lod1_src.glb` y `zombie_lod2_src.glb`. Pesos pasados con `prep_tripo.py … mesh=remesh.glb` (Data Transfer, cara más cercana interpolada, desde `zombie_samurai.glb`); usan el `zombie_rig.json` del LOD0 (RJ y raíces idénticos). En `zmodel.js` cada LOD es una «parte» (`ZM.parts`: su `InstancedMesh` y su contorno, mismo material y misma textura de matrices; `zmBody` por instancia dice la fila). `ZM.load(url,scene,[lod1,lod2])` los carga después del LOD0. `ZM.add` elige el LOD por la distancia horizontal al foco de la cámara (`ZM.lodAt(camTX,camTZ,k)`): < 5 m LOD0, < 9 m LOD1, más lejos LOD2 (`ZM.lodD`), dividida por la escala del cuerpo y por `k` (0,5 en calidad 0). 7.º parámetro de `ZM.add` para forzar un nivel. Los pesos pintados a mano (`_fix.json`, `w`) solo valen para el LOD0. Cortes, ceniza y tinta funcionan igual en los tres. Medido: en la oleada 6 casi todos los zombis visibles están a < 5 m del jugador (se amontonan), así que el ahorro real es pequeño; en este PC (CPU ×4) los fps no cambian ni con todo en LOD2 (triángulos 147k → 38k): el límite allí es la CPU. Donde más puede ayudar es en la GPU de un móvil.
- **Oni con modelo (28 nov 2026):** `window.ZMO` (onis, 24 cuerpos, color por cuerpo) carga `models/oni.glb` (1036 triángulos) con LOD `oni_lod1.glb` (800) y `oni_lod2.glb` (500), y `oni_rig.json`. Las tres salen del remesh de ~500 caras que Daniel hizo en Tripo (`models/src/oni_remesh_src.glb`); la malla completa con textura (`models/src/oni_src.glb`, 7703 triángulos) bajada a 1500 se veía llena de esquirlas, así que no se usa. Sin rig de Tripo (gratis): los pesos se pasan del zombi samurái con rig, que está en la misma escala y pose en T (`prep_tripo.py models/src/zombie_samurai.glb models/oni.glb models/oni_rig.json 1100 mesh=models/src/oni_remesh_src.glb`). Uso en el dibujo: `ZMO.load('models/oni.glb',scene,['models/oni_lod1.glb','models/oni_lod2.glb'])` una vez; cada fotograma `ZMO.begin()`, `ZMO.ink=ZM.ink`, `ZMO.lodAt(camTX,camTZ,k)`, por oni `ZMO.add(S.J,S.yaw,S.s,null,new THREE.Color(col))` (si devuelve false, palos) y `ZMO.end()`.
- **Addon Mixamo → palos (28 nov 2026)**, `models/tools/stickronin_mixamo.py`: convierte una animación de Mixamo en un clip del editor (`{"anims":[…]}` con `head, neck, pel, hL, hR, fL, fR` + `chest, eL, eR, kL, kR`). Se instala en Blender (Preferencias → Complementos → Instalar desde disco); panel en la barra lateral (N) → «Stick Rōnin»: acción, clave cada N fotogramas, «En el sitio» / «En el cuerpo», girar 180°, ciclo, arma, hoja (Auto / Dos manos / Fija) y botones «Copiar clip» (portapapeles), «Guardar .json» y «Ver palos» (malla `SR_palos` animada con claves de forma junto al personaje). El clip se pega en `editor.html` → Animación → Importar. Sin ventana: `blender -b --python stickronin_mixamo.py -- entrada.glb|fbx salida.json [acción] [paso] [ensitio|encuerpo] [girar]`. Retarget por direcciones: cada hueso de Mixamo da la dirección y el stickman pone SUS medidas (cuello→cabeza 0,15; pelvis→cuello 0,55 con el pecho al 58 %; brazo 0,3+0,3; pierna 0,47+0,47), así el IK del juego reproduce los codos y rodillas exactos. Altura: el pie más bajo a la altura a la que Mixamo levanta el suyo sobre el reposo (escala = pierna del stickman / pierna de Mixamo). Hoja: con las manos de los palos a < 0,36 m va de la mano izquierda a la derecha (agarre de katana); si no, la última o la del reposo. Ejes: Blender (Z arriba, mira a −Y) → local del stickman = (−x, z, −y). Probado con el combo de katana de `models/src/player_ronin.glb` (97 claves, importado en el editor sin errores; render de comparación en Blender).
- Ojo Blender 5.2: `prep_tripo.py` quita toda la animación del esqueleto (`animation_data_clear`) y refresca antes de leer los puntos; si no, los lee en la pose del último fotograma (salía un RJ agachado).
- `ZM.begin/add/end` en `draw()`. Interruptor «🧟 Modelos 3D» (`KGFX.model`, encendido por defecto); si el GLB no carga (p. ej. abriendo como archivo) se dibujan palos.
- Rendimiento (CPU ×4, oleada 6): ~43 fps con 64 modelos, igual que con palos.
- **Ceniza al morir** (`ASH`, `ashK`, `ashPuff`, `ashRise`; rehecho el 27 nov 2026 inspirado en el disuelto de Codrops y en three.quarks): los cuerpos (ragdolls con `r.ash` y cadáveres partidos) caen ~0,75 s y entre 0,75 y 1,3 s **arden**: el shader del modelo (`zmDis` por instancia, 6.º parámetro de `ZM.add`) quita la malla con ruido 3D de la cabeza a los pies, con una franja incandescente blanco-amarillo → naranja y carbón detrás. Brasas aditivas con halo (`embers`, `addE`, tope `EMM` 520; suben, se mecen y se enfrían) salen por el frente de fuego (`ashJoint`) y copos oscuros (`k:'f'`) flotan. A 1,3 s desaparecen y los de zombi normal se convierten en 2 minis (`GORE.CONVERT_T`), que brotan con `ashRise` (sin humo gris). Con palos, el cuerpo se oscurece y encoge (`ashCol`). Rendimiento igual (CPU ×4, oleada 6: ~46 fps).
- Cuerpos caídos: la dirección (`r.yaw`, `C.yaw`) se fija al morir (la del zombi) y no se recalcula cada fotograma; recalcularla por las rodillas hacía girar 180° el cuerpo y retorcía la malla.
- Ojo r128: los colores de vértice normalizados de 16 bits no se convierten solos (se dividen entre 65535 al cargar).
- Nuevos modelos de Tripo: Blender 5.2 + `models/tools/prep_tripo.py entrada.glb salida.glb salida_rig.json [triángulos] [tex] [apose=50] [fist=75] [fit] [mesh=remesh.glb]` (vale para rigs de Tripo y de Mixamo; `tex` conserva la textura a 512 px; `apose`/`fist` (Mixamo, `pose_rest.py`) dejan el reposo con los brazos bajados y los puños cerrados; `fit` coloca pecho y cabeza con las proporciones del stickman). El protagonista se hizo con `3200 tex apose=50 fist=82 fit hands=1`. `hands=1` protege las manos al bajar triángulos (grupo temporal «resto» = 1 − peso de los huesos de la mano en el `DECIMATE`; sin él, los dedos curvados se rompían en pinchos: 287 → 529 vértices en cada mano). `fist` cierra el puño en la pose en T (palmas hacia abajo) ANTES de bajar los brazos: cada dedo gira alrededor de un eje fijo (dirección de su primera falange × abajo), igual para sus tres falanges (`FIST_J` 1,05 / 1,25 / 0,85); así se dobla hacia la palma aunque cada hueso tenga otro giro (con el eje X propio, la izquierda se cerraba hacia el dorso y la derecha de lado). Comprobación: primera falange −0,99/−1,00 hacia la palma, punta a 0,019 m del nudillo.
- **Análisis del protagonista (28 nov 2026):** la cabeza se hundía porque el tramo cuello→cabeza del modelo medía 0,228 frente a 0,151 del stickman (se aplastaba ×0,66); el torso se partía mal (×1,27 y ×0,72); los hombros se pellizcaban al girar 90° desde la pose en T y la clavícula iba con el pecho. Arreglos: `fit` (todo el torso ×0,96), `apose=50` y la clavícula asignada al brazo (`LeftShoulder`→(1,4)).
- **Versión de archivos (`?v=`):** las páginas cargan `models/inkstyle.js?v=…` y `models/zmodel.js?v=…`, y `zmodel.js` pide los GLB, `_rig.json` y `_fix.json` con `?v=AV`. Hace falta porque githack/raw.githubusercontent pueden servir un archivo nuevo junto a otro viejo (pasó el 28 nov 2026: `shaders.html` nuevo con `inkstyle.js` viejo = pantalla negra). **Al cambiar `models/*.js` o los modelos, sube `AV` en `zmodel.js` y el `?v=` de las etiquetas `<script>` de `index.html`, `editor.html`, `shaders.html` y `modelo.html`.**
- **Correcciones a mano** (`modelo.html`): se guardan en localStorage `stickronin_mfix_<nombre>` o en `models/<nombre>_fix.json` (si el `_rig.json` lleva `hasFix:true`); `zmodel.js` las aplica al cargar: `K`, `smin`/`smax` (límites de estiramiento), `RJ`, `root` y `w` (pesos por vértice `[a,b,w]`). Guardan `n` (vértices del modelo): si el modelo se regenera y cambia, los pesos pintados se ignoran (los índices ya no encajan). `modelo.html` deforma el modelo en el procesador con las mismas cuentas que el shader para poder pintar sobre él. (baja triángulos, quita texturas, guarda los tramos de cada vértice según los pesos del rig de Tripo y exporta la malla + el JSON).

## Estilo tinta 墨 (27 nov 2026)
- **Todos los números del estilo en `models/inkstyle.js`** (`INKS.DEF` con clave, grupo, etiqueta, tipo, valor, rango; valores `INKS.v`, uniforms compartidos `INKS.u`; guarda en localStorage `stickronin_ink` solo lo que difiere del valor por defecto y avisa a otras pestañas). Se ajustan con deslizadores en `shaders.html`; `INKS.patch` (sombreado en 3 tonos de cualquier Lambert), `INKS.scan` e `INKS.tone` (gris de zombi) los comparten el juego y las páginas; para dejarlos fijos para todos, copiar el JSON del editor en los valores por defecto de `inkstyle.js`.
- Bloque «ESTILO TINTA» de `index.html` (`inkApply`, `inkPatch`, `inkScan`, `inkTone`, `INK_B`; lee `INKS`); guía en `02-DOCS/wiki/arte/estilo-visual.md`. Interruptor «🖌 Estilo tinta» (`KGFX.ink`): encendido por defecto fuera de `github.io` (dev, local) y apagado en la web oficial, como los números de daño.
- Paleta de papel (niebla `#e8e1d4`, suelo hueso, edificios en tinta, pagodas en aguada, sol rojo `#c8102e`); al apagar se restauran los colores de `INK.orig`.
- Sombreado en 3 tonos en **todos** los `MeshLambertMaterial` (`inkPatch` envuelve su `onBeforeCompile` y conserva su `customProgramCacheKey`; el uniform `INK.on` es compartido, así que encender/apagar no recompila). `inkScan` repasa la escena cada 90 fotogramas para los materiales nuevos.
- Contorno de tinta con «casco invertido»: `INK_B` reutiliza la geometría de los lotes `SEG, SPH, ZB_SEG, ZB_SPH, SEGL, SPHL` (0 CPU, 1 llamada por lote); ojo, `bSeg` monta los cilindros en espejo y por eso los segmentos usan `INKOUT_S` (FrontSide). El modelo tiene `ZM.outline` (mismo parche, inflado `ZM.inkU`, respeta cortes y ceniza). Sin contornos en calidad 0.
- Enemigos en tinta (`inkTone`): grises con contorno negro (28 nov 2026, a petición de Daniel: `eBase` 0,11, `eVar` 0,3, `eGlow` 0,12); el rojo queda para el jugador, la sangre, los ojos y el peligro; los colores de los kami solo en los brillos (decidido con Daniel).
- Rendimiento (CPU ×4, oleada 6, calidad 2): 43,7 fps con tinta y 120 modelos frente a 46,2 sin tinta.

## Editor de animaciones (`editor.html`)
- **Interfaz sin menús desplegables (28 nov 2026)**, inspirada en Cascadeur (barra de herramientas fija y línea de tiempo con sus herramientas de clave) y en Procreate Dreams / Stick Nodes (línea de tiempo táctil siempre a mano, iconos):
  - arriba, dos tiras deslizables: armas (`#wStrip`, con «General» para reposo y correr) y animaciones de esa arma (`#aStrip`, más «＋ Nueva»); `fillSel`, `selectAnim`, `newAnim`, `libGroup`;
  - izquierda, herramientas (`#railL`): Mover/Rotar, Cadena, Codos, Gizmo, Fantasma, Recorrido, Correr, Zombi, Prota; derecha (`#railR`): Frente, Lado, Arriba, 3D, Centrar, Paneo, Deshacer, Rehacer, Pantalla, Jugar;
  - abajo, línea de tiempo y transporte siempre visibles; pestañas con icono (Pose, Golpes, Efectos, Animación); tocar la pestaña activa pliega el panel (`#dock.fold`);
  - dentro de los paneles, botones de elección (`chipRow`, `bindChips`) en vez de `<select>`: curva, efecto nuevo, dónde, color, sonido, forma, articulación, arma, uso en el juego y la secuencia de «Correr»;
  - en el móvil en horizontal, la vista a la izquierda y biblioteca/tiempo/panel en una columna a la derecha.
- Genera clips de referencia desde el `ATK` del juego (`GEN_V`, `GEN_ATK`) y los guarda en localStorage, en ranuras `arma:tecla`.
- Deslizadores `we` (separación arma–mano) y `wox/woy/woz`. La kusarigama dibuja la cadena hasta el arma.
- La estela del editor sigue la posición del arma.
- Botones «🧟 Modelo zombi» y «🥷 Modelo protagonista» (ver el modelo en vez de los palos; `zmKind`). Necesita abrirse desde un servidor para cargar el GLB.
- Los ajustes del estilo tinta ya NO están en el editor (28 nov 2026, a petición de Daniel): van en `shaders.html`; los pesos y el esqueleto de los modelos en `modelo.html`. El menú del editor enlaza a las dos.

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

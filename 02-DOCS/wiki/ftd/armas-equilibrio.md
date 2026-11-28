---
estado: hecho (primera pasada)
fecha: 2026-11-28
rama: claude/armas-combos-a6cb49 → dev
---

# Armas flojas y bendiciones de ataque (oleada 5)

## Intención
Daniel nota que la oleada 5 se atraganta con algunas armas y que, salvo Raijin, las bendiciones de ataque apenas suben el daño. Objetivo: que ninguna arma se quede muy por debajo del resto contra un grupo, cambiando sus ataques cuando haga falta y no solo los números.

## Cómo se midió
Simulación con Playwright (fuera del repo): el jugador machaca atacar 20 s rodeado de 10 zombis quietos de la oleada N, en un claro del dojo (−2,5; 12,5). Se mide el daño útil por segundo (en pantalla, sin contar lo que sobra al matar). Sin carga, especial ni dash. Ruido de ±20-40 % en el cuerpo a cuerpo: vale para comparar, no como dato exacto.

## Fallos encontrados (afectaban a la partida real)
- [x] **Los proyectiles no daban a los minis** (miden ~1 m y los tiros vuelan a 1,3 m). `updateProj`: altura mínima de impacto 1,3 m y radio mínimo 0,25. **Prueba:** shuriken 7 → 36 solo con esto.
- [x] **El abanico de shuriken y la ráfaga del yumi perdían golpes**: `kgZHit` ignoraba un segundo golpe al mismo zombi en 0,09 s. Los proyectiles (`KGPJ`) ya no pasan por ese filtro.
- [x] **Rodeado y sin joystick, disparabas o golpeabas al vacío**: solo se apuntaba en un cono delante. Ahora, si no hay nadie en el cono y no mueves el joystick, se apunta al más cercano (a distancia ≤ 8 m o ≤ 3 m en el cuerpo a cuerpo): `aimDir` y `startAttack`.

## Cambios por arma
- [x] **Katana:** hoja más ancha (radio de golpe 0,12 → 0,3 en sus 3 clips) y el 3.er golpe (giro) lanza un corte de viento (`fx wave`, 0,35). Daño 1 → 1,2. Clips integrados `BUILTIN_V` u2 en juego y editor.
- [x] **Kama:** el 4.º golpe pasa a ser un torbellino (`c4` con `spin`). Daño 0,7 → 0,95.
- [x] **Tessen:** el 3.er golpe pasa a ser un giro que aparta (`t3` con `spin`, empuje 10). Daño 0,7 → 1.
- [x] **Shuriken:** 1 → 1,3 por estrella; el 3.er lanzamiento es un abanico de 5 (antes 3).
- [x] **Tanegashima:** recarga 1 → 0,75 s; cada bala estalla al impactar (1,3 m, 10 de daño alrededor; `boomR`/`boomD`).
- [x] **Yumi:** flechas de la ráfaga 1 → 1,2.
- [x] **Kanabō:** 2 → 2,4 (tumba de un golpe en la oleada 5). **Nitō:** 0,6 → 0,75.
- [x] Editor: `GEN_ATK` con los nuevos `c4` y `t3` (`GEN_V` g7) y clips de katana iguales que en el juego.

## Tanegashima rehecha (petición de Daniel, 28 nov 2026)
- [x] Autoapuntado con diana roja (como el yumi). **Prueba:** el especial sin arrastrar giró hacia los 6 zombis y los mató.
- [x] Saltar = disparo al suelo, 3 veces antes de tocar suelo, daño en área abajo con la bendición de 斬 y extra por kami. **Prueba:** saltos 1-3 dan `gunJ` 1-3 y el 4.º no sale; el 1.º con Raijin mató 7 de 8 alrededor; vuelve a 0 al aterrizar.
- [x] Especial más fuerte (7 perdigones de 3,5 + cono) y desplaza más. **Prueba:** 8,7 m de retroceso (antes 15 × 0,22 ≈ 3,3 m).
- [x] Guía de lanzamiento al mantener el especial; arrastrar sobre el botón apunta; soltar lanza. **Prueba:** `spGuide` visible mientras se mantiene; se lanza al soltar.
- [ ] Probar en el móvil el arrastre sobre el botón (en el PC solo se simuló).
- [ ] El disparo hacia el suelo es una pose fija, no un clip del editor (igual que los demás disparos).

## Yari y tessen fuera; entran Tekkō y Ofuda (decisión de Daniel, 28 nov 2026)
- [x] Tablas: `WT`, `ATK`, `WBASE`, `KAI`, `kaiOK`, `TSUCHI`, `RYU`, `TYPE_N`, `TYPE_I`, `WICON`, `WDESC`, `SPN`, mallas; efectos de martillos/estilos viejos quitados y nuevos programados. **Prueba:** `grep yari|tessen` solo deja la tabla de conversión `WMIG`; `node --check` correcto.
- [x] Tekkō: combo de 4 con uppercut que lanza, cargado al suelo y AGARRE. **Prueba:** en el dojo el 4.º golpe deja enemigos en el aire; el agarre levanta y lanza (golpea al que cruza y estalla al caer). Simulación oleada 5: 35 de daño por segundo (como kama y nitō).
- [x] Ofuda: talismanes que buscan y estallan, sello cargado y GRULLA. **Prueba:** el sello hizo 50 en área; simulación oleada 5: 58.
- [x] Partidas guardadas con yari/tessen se convierten (`WMIG`).
- [x] Editor: `W_N`, mallas y `GEN_ATK` con la Tekkō (`GEN_V` g8). **Prueba:** el editor carga sin errores y genera 8 clips `tekko:*` y la tira muestra Tekkō y Ofuda.
- [ ] Probar en el móvil; la maestría Ryū ganada con yari/tessen no pasa a las nuevas.
- [ ] Hoja de equilibrio (pestaña Armas) sin actualizar.

## Eventos más espaciados (petición de Daniel, 28 nov 2026)
- [x] Director de eventos `EV` (separación mínima 14 s, nada con el jefe vivo, incursiones nunca en oleada de jefe y a los 25-45 s).
- [x] Amanojaku raro: 1 como mucho, nunca en oleadas seguidas, más probable cuanto más tiempo pasas abajo.
- **Prueba** (oleadas 5-8, jugador quieto abajo, 110 s cada una): antes «oleada 5: jefe a los 2 s, Amanojaku a los 4 s, incursión a los 13 s»; ahora «oleada 5: jefe a los 2 s, yokai a los 45 s, Amanojaku a los 60 s, yokai a los 76 s», y en las demás, eventos separados ≥14 s, con el Amanojaku solo en la 5 y la 7.

## Shuriken metralleta (petición de Daniel, 28 nov 2026)
- [x] Mantener = ráfaga continua (~8/s) corriendo al 95 %; recalentado a los 3 s; abanico de kunai al soltar tras 1 s. Solo el shuriken dispara corriendo: el yumi, la tanegashima y la ofuda frenan al disparar. **Prueba** (paso a paso, zona despejada, 1,5 s): shuriken manteniendo 6,2 m/s, igual que sin disparar; yumi 5,4; tanegashima 3,4; 8 disparos/s; recalentado a los 3 s.

## Bendiciones de ataque (ranura 斬)
- [x] Kagutsuchi, Yuki-onna y Tsukuyomi suman +50 % de daño al golpe (×1,3 → +65 % en pantalla), como Hachiman y Benzaiten. Yuki-onna pone 2 pilas de escarcha por golpe. Textos actualizados.
- [ ] Pendiente de hablar con Daniel: Raijin sigue muy por encima porque reparte daño en área; los % fijos se notan poco por los umbrales de golpes (p. ej. katana 12 × 1,65 = 19,8 < 21 en la oleada 5).

## Evidencia (daño por segundo en pantalla, sin bendición)
| Arma | Oleada 5 antes → después | Oleada 10 antes → después |
|---|---|---|
| Katana | 17 → 109 | 34 → 110 |
| Shuriken | 9 → 71 | 13 → 79 |
| Tanegashima | 9 → 42 | 17 → 93 |
| Yumi | 37 → 75 | 58 → 96 |
| Kama | 14 → 34 | 24 → 43 |
| Tessen | 19 → 25 | 34 → 49 |
| Nitō | 29 → 32* | 50 → 93 |
| Kanabō | 40 → 41* | 104 → 96* |
| Kusarigama (referencia) | 242 → 233 | 282 → 242 |

\* antes de su subida de daño o dentro del ruido. Sintaxis: `node --check` del script principal de `index.html` y `editor.html`. Capturas: katana, kama, tanegashima y shuriken en el dojo.

## Siguiente
- Nitō, kama y tessen siguen en la parte baja en la oleada 5: revisar por qué fallan golpes (alcance, avance) y probar en el móvil.
- Chispas del estallido del arcabuz en tinta (ahora azules, heredadas de Ōzutsu).
- Hoja de equilibrio: pestaña Armas (daño base) y Kami (textos de 斬) sin actualizar todavía.

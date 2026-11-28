---
author: Claude (para Daniel)
branch: feat/kami-cartas → dev
status: in-progress
---

# Kago 加護 · bendiciones de los kami (versión completa)

## Intención
Cambiar el sistema de mejoras (forja con 5 verbos y multiplicadores de ±12 %) por uno basado en sinergias como Hades e Isaac. Las estadísticas tienen que notarse mucho y las 12 armas tienen que servir en todas las fases, unas fáciles y otras exigentes. Daniel pidió la versión completa del informe `reports/Mejoras por sinergias estilo Hades.md`, no la mínima.

## Alcance
Modo normal, dojo y asedio (desde el 27 nov 2026 también el asedio). La Cacería solo pierde las rarezas de arma. No hay animaciones nuevas: el editor no cambia.

## Checklist (con cómo se prueba)
- [x] Daño numérico ×10, vida de zombi por oleada, `WBASE` por arma y crítico Kaishin por arma. **Prueba:** t2, 1627 bajas en 3 combinaciones sin errores.
- [x] Armadura amarilla (yoroi, onis, minijefes, jefes por fases) y ruptura que aturde. **Prueba:** t1 muestra `[A]` solo en yoroi y onis tras corregir `e.arm` → `e.yr`.
- [x] 8 kami × 5 ranuras, pasivas, 12 dúos, 8 Shinpō, Omiki y rarezas. **Prueba:** t2 con todo activo, sin errores.
- [x] Santuario hokora por oleada (dos cada 3) y oferta de 1 de 3 con reroll, destierro y curación. **Prueba:** t1/t4, capturas s4 y t4_w1.
- [x] Martillos Tsuchi (24), estilos Ryū (12) con reto y maestría, y armería antes de jugar. **Prueba:** t1 (oleada 5 → martillo) y captura s1.
- [x] Kamon de 5 juegos y Henge con cambio visual. **Prueba:** t2, captura t2_2 (aliento Ryū y alas).
- [x] Pactos de Shinigami, trato del oni / ofrenda y tienda del tanuki. **Prueba:** t1, pantallas oni y shop.
- [x] Campeones tatari (8) y enemigos nuevos (yoroi, yumi, sōhei, kagami, tanuki); tope de 90. **Prueba:** t1/t2.
- [x] Game feel: hit-stop por daño, crítico, ruptura y último enemigo; vibración; ceremonia de cartas y sinergias; interruptores. **Prueba:** capturas de cartas.
- [x] Rendimiento. **Prueba:** t3 con CPU ×4 en la oleada 6: 50,8 fps antes y 48,8 fps ahora.
- [x] ℹ Info y códice. **Prueba:** t4 (45 entradas).
- [x] Hoja de equilibrio: pestañas Kago, Armas, Kami y Enemigos, y columnas K-M en Escalado. **Prueba:** lectura de la revisión 9 (6, 8, 10, 12, 14…). No se ha borrado nada.
- [x] Borrar la forja vieja del modo normal (código, números de `AR` y ~120 reglas CSS sin uso) sin tocar la del asedio. **Prueba:** t1 (flujo normal), t2 (combinaciones), t5 (asedio: botín del jefe, forja ⛓ y mejora) y t6, todo con `{"n":0}`; `node --check` correcto.
- [x] Arreglo: la armería ya no se abre al entrar al dojo, la sala MP, el asedio o la prueba de yokai. **Prueba:** t5/t6 (dojo → estado `dojo` sin armería; normal → armería).
- [x] Asedio con Kago: bendición al empezar, santuarios ⛩ y cartas al acabar cada oleada; sin metal, bolsa, rarezas ni forja del asedio; bots con daño fijo. Cacería y sala MP con armas sin rareza. **Prueba:** t7 (asedio: inicio, cartas, oleada 2, recoger arma, jefe), t8 (sala MP), t1/t2/t6 sin errores.
- [x] Fuera rarezas de carta (valor único ×1,5, niveles con Omiki). **Prueba:** t1/t7 sin errores.
- [x] Efectos muy visibles (estados, zonas, rayos, ondas, estela del dash, brillo del arma) y especial/dash como poderes del kami. **Prueba:** t10 (capturas de los 8 kami), t3 rendimiento CPU ×4: 53,4 → 49,1 fps; t1/t2/t7/t8 sin errores.
- [x] Interruptor de números de daño (encendido fuera de github.io). **Prueba:** t12.
- [x] Parry fuera en normal/asedio → esquiva perfecta 避 con el dash; parry PvP con anti-machaque y bloqueo al fallar. **Prueba:** t13/t14 (esquiva: 0 daño, cámara lenta, ×2,5, recarga; PvP: 0,18 / 0,05 / bloqueo 0,45 s), t1/t2/t7/t8 sin errores.
- [x] Cacería: armas del suelo con bendiciones que crecen con el tiempo. **Prueba:** t15 con dos pestañas (?bc=1): B ve las armas con sus kami, A recoge Nv3, golpe con 🔥❄🌸 → 100→70, quemadura hasta 58, 55 % de velocidad, controles al revés; A ve los estados de B y B el brillo del arma de A.
- [x] Cacería: una sola arma, solo se cambia al empezar o tras morir. **Prueba:** t16 (dos pestañas: coge una, la otra sale 🔒, ⇄ no cambia, tras morir puede coger otra y se vuelve a bloquear).
- [x] Limpieza: fuera masa de zombis (malla y buffers), carrera lateral por la pared, `skyTarget`, parry PvE viejo (`deflect`/`counterAttack`), kamon de prueba viejos del dojo (ahora da kamon Kago) y variables sueltas. **Prueba:** carga sin errores; t1/t2/t7/t13/t16/t17.
- [x] Equilibrio: tienda con precios crecientes y 1 onigiri por visita, menos tama, zombis ×1,05 por oleada, +4 % de daño recibido por oleada, curación 15, base ×1,3. **Prueba:** t17 (40→60→80, tama 300→170, onigiri bloqueado).
- [x] Tienda rotativa con límite (2 por visita, 6 por partida, a veces 3/7), Omiki más raro y flojo, nueva escala de vida de zombis/yokai/jefes, enemigos +5 %/oleada. **Prueba:** t18 (4 objetos, 2 compras y 🔒, tope 6/6; vida 6/21/52/193).
- [x] Enemigo 天邪鬼 Amanojaku en azoteas: dispara, huye con gancho, muere con tu gancho. **Prueba:** t18 en el dojo (en azotea, 3 disparos = −24, huye al acercarte, el gancho lo apunta y lo mata); t1/t2/t7/t13/t16 sin errores.
- [x] Veneno 毒 + 濡れ女 Nure-onna y 海月火 medusas. **Prueba:** t19 (escupitajo envenena 100→91→83, mordisco −13, charcos, medusas a 3 m, nube al reventar, gancho las apunta), t20 captura, t21 (salen en oleadas), t1/t2/t7/t18 sin errores.
- [x] Modelo 3D del zombi (Tripo) siguiendo los 12 puntos: vivos, ragdolls, cortes y cadáveres desmembrados; reverencia al morir; modelo y clips en el editor. **Prueba:** t22 (capturas vivos y cortes), t25 (3 cadáveres con modelo, 4 reverencias), t26 rendimiento (37,8 vs 43,8 fps), t27 editor (clips y modelo); t1/t2/t7 sin errores (sin servidor vuelven los palos).
- [x] Modelo del zombi pasado a piezas rígidas (sin esqueleto ni reverencia), dibujadas por instancias; editor adaptado. **Prueba:** t22 (vivos y cortes), t25 (3 cadáveres), t27 (editor), t26 rendimiento: ~42 fps con modelos frente a 39-43 sin ellos.
- [x] Modelo deformado en la GPU (malla entera, articulaciones suaves, cortes limpios sin pinchos). **Prueba:** t22/t25 (capturas de vivos, ragdoll cortado y cadáveres), t27 (editor), t26: 43,4 fps con 64 modelos frente a 42,6-44,6 sin modelos.
- [x] Muerte en ceniza rehecha: el modelo arde con borde de brasa (shader con ruido), brasas aditivas y copos; los minis brotan sin humo. **Prueba:** t34 (8 capturas de 0,5 a 1,6 s y zoom del borde), t26: 45,7 fps con 115 modelos (CPU ×4).
- [x] Estilo tinta (blanco, negro y rojo): paleta de papel, sombreado en 3 tonos, contornos de tinta en palos y modelo, enemigos en tinta; interruptor «🖌 Estilo tinta». **Prueba:** t35/t36 (capturas con y sin tinta, zoom del jugador), t38: 43,7 fps con tinta frente a 46,2 sin ella (CPU ×4, oleada 6).
- [x] Gancho: soltarlo si el Amanojaku/Kurage muere mientras vuela (te bloqueaba). **Prueba:** t39 (muere / desaparece / normal: sin gancho tras 1,5 s y te mueves; la versión anterior se quedaba con el gancho).
- [x] Protagonista 3D en tinta aguada (`ZMP`, `models/player.glb`). **Prueba:** t36 (capturas con y sin tinta, zoom del fajín rojo), t38: ~45 fps con y sin tinta (CPU ×4, oleada 6).
- [x] Editor de shaders en el editor (pestaña «🖌 Shader», ajustes en `models/inkstyle.js`). **Prueba:** t40 (25 deslizadores, 11 colores, 1 interruptor; cambios en vivo en el editor y en el juego abierto en otra pestaña; probar ceniza; valores por defecto).
- [x] Tira de tela con física en el protagonista 3D y zombis grises con tinta negra. **Prueba:** t41 (jugador corriendo: tira visible ondeando, zombis grises), t38: 46,4 / 44,4 fps sin / con tinta.
- [x] Protagonista: análisis (cabeza ×0,66, torso ×1,27/×0,72, hombros desde pose en T) y arreglo en Blender (`apose=50 fist=75 fit`, clavícula con el brazo). **Prueba:** t42 (todo el torso ×0,96), t43 (capturas antes/después de frente y de lado).
- [x] `modelo.html` (pesos y esqueleto a mano) y `shaders.html` (estilo tinta) aparte; fuera la pestaña del editor. **Prueba:** t44 (pintar 45 vértices, guardar, el juego los carga, volver al original), t45 (7 grupos, 25 deslizadores, 11 colores, el juego lee el cambio, editor sin la pestaña y con los enlaces), t41 (juego sin cambios).
- [x] Editor de animaciones sin menús desplegables (tiras de armas y animaciones, barras de herramientas a los lados, línea de tiempo fija, pestañas con icono, botones en vez de `<select>`, distribución horizontal). **Prueba:** t48 (23 comprobaciones: elegir arma y animación, nueva, arma y uso por botón, curva, efecto y color, golpe con forma y articulación, herramientas, mover/rotar, vistas, plegar panel 393 → 686 px, secuencia de «Correr», deshacer; 0 `<select>`, sin errores) y capturas en vertical y horizontal.
- [x] Manos del protagonista: los dedos se rompían en pinchos al bajar triángulos. Manos protegidas en el `DECIMATE` (`hands=1`), puño más cerrado por falanges y pulgar cruzado, 3200 triángulos. **Prueba:** renders de la mano antes/después en Blender, vértices de la mano 287 → 529, t49 (mano de cerca en `modelo.html` con la deformación del juego), t36.
- [x] Puño hacia el lado correcto: se cierra en la pose en T con un eje fijo por dedo (antes la izquierda se cerraba hacia el dorso y la derecha de lado). **Prueba:** primera falange hacia la palma −0,99 / −1,00 (antes +0,98 / −0,28), punta a 0,019 m del nudillo, render de cada mano aislada desde la palma y el dorso.
- [x] LOD del zombi: remesh de Tripo (800 y 500 triángulos) con los pesos pasados en Blender (`prep_tripo.py mesh=`), una `InstancedMesh` por LOD con la misma textura de matrices; < 5 m del foco LOD0, < 9 m LOD1, más lejos LOD2 (mitad en calidad 0). **Prueba:** RJ/raíces de los LOD = `zombie_rig.json` (diferencia 0); capturas de los mismos 9 zombis en LOD0/1/2 (misma pose) y reparto automático 2/4/3; cortes (cabeza, brazo, pierna) y ceniza al 35 % con brasa en los tres LOD; móvil simulado (412×915, CPU ×4, oleada 6, tinta): 49 zombis, 73-88 fps sin tope de 60 tanto con LOD como sin él (ruido; límite de CPU), triángulos 147k → 38k con todo en LOD2; sin errores de página.
- [x] Addon de Blender Mixamo → 11 palos (`models/tools/stickronin_mixamo.py`): clip del editor desde cualquier animación de Mixamo. **Prueba:** combo de katana de `player_ronin.glb` → 97 claves, brazos 0,3+0,3 y piernas 0,47+0,47 exactos, pies a 0–7 cm del suelo; importado en `editor.html` sin errores (capturas a 6 tiempos); panel, «Copiar», «Ver palos» (12 vértices, 11 palos, 66 claves de forma) y desregistro probados en Blender 5.2; render del personaje junto a los palos en 4 fotogramas.
- [x] LOD2 del zombi bajado a 500 triángulos (Tripo dio 568). **Prueba:** 499 triángulos, RJ y raíces = `zombie_rig.json`.
- [ ] Probarlo Daniel en el móvil (enlace de dev).

## Evidencia
Pruebas con Playwright y Chrome (viewport 412×915) en el scratchpad de la sesión: `t1` flujo completo, `t2` todas las combinaciones, `t3` rendimiento y `t4` códice y oleadas. `window.__errs` siempre a `{"n":0}`.

## Siguiente
Daniel lo prueba en el móvil desde `dev` y ajustamos los números en `KG`.

## Cambio 28 nov 2026 (sesión de armas)
- Ranura 斬: Kagutsuchi, Yuki-onna y Tsukuyomi suman +50 % al golpe (como Hachiman y Benzaiten); Yuki-onna pone 2 pilas de escarcha por golpe. Motivo y medidas en `armas-equilibrio.md`.

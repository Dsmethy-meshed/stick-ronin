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
- [ ] Probarlo Daniel en el móvil (enlace de dev).

## Evidencia
Pruebas con Playwright y Chrome (viewport 412×915) en el scratchpad de la sesión: `t1` flujo completo, `t2` todas las combinaciones, `t3` rendimiento y `t4` códice y oleadas. `window.__errs` siempre a `{"n":0}`.

## Siguiente
Daniel lo prueba en el móvil desde `dev` y ajustamos los números en `KG`.

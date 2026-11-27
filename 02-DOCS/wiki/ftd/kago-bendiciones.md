---
author: Claude (para Daniel)
branch: feat/kami-cartas → dev
status: in-progress
---

# Kago 加護 · bendiciones de los kami (versión completa)

## Intención
Cambiar el sistema de mejoras (forja con 5 verbos y multiplicadores de ±12 %) por uno basado en sinergias como Hades e Isaac. Las estadísticas tienen que notarse mucho y las 12 armas tienen que servir en todas las fases, unas fáciles y otras exigentes. Daniel pidió la versión completa del informe `reports/Mejoras por sinergias estilo Hades.md`, no la mínima.

## Alcance
Solo el modo normal y el dojo. El asedio y la Cacería no cambian. No hay animaciones nuevas: el editor no cambia.

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
- [ ] Hoja de equilibrio: pestañas nuevas.
- [ ] Probarlo Daniel en el móvil (enlace de dev).

## Evidencia
Pruebas con Playwright y Chrome (viewport 412×915) en el scratchpad de la sesión: `t1` flujo completo, `t2` todas las combinaciones, `t3` rendimiento y `t4` códice y oleadas. `window.__errs` siempre a `{"n":0}`.

## Siguiente
Daniel lo prueba en el móvil desde `dev` y ajustamos los números en `KG`.

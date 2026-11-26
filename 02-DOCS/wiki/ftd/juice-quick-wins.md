# Juice: primeras mejoras rápidas

**Intención:** que las hordas se sientan fluidas y que el sonido no canse ni sature. Daniel lo pidió el 26 nov 2026 tras la auditoría [juice-report](../auditorias/juice-report.md).

**Alcance:** `index.html`: S-05 (hit-stop en ráfagas), S-02 (variación de tono) y S-03 (bus maestro con compresor). Sin cambios de reglas, daño ni puntuación.

## Checklist
- [x] S-05 hit-stop en ráfagas, con interruptor `JUICE.hsBurst`.
- [x] S-02 variación de tono ±6 % y volumen ±10 %, con interruptor `JUICE.pitchVar`.
- [x] S-03 bus maestro + compresor, con interruptor `JUICE.master`.
- [x] Sintaxis (`node --check`) y prueba en navegador sin errores.
- [x] Textos relacionados revisados (regla 4): ningún texto del juego habla de esto. Pendiente para las notas de la v1.6: «golpes en ráfaga más fluidos y sonido sin saturar».
- [x] Subido a `dev`.

## Evidencias
Ver [juice-changes](../auditorias/juice-changes.md): `node --check` correcto; prueba en navegador con 0 errores; números de hit-stop, tono y bus medidos.

## Siguiente paso
Probar en Android: hordas de la oleada 6 o más y combos largos.

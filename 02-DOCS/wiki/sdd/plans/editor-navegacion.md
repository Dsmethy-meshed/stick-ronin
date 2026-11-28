---
type: plan
title: Plan — editor más cómodo y herramientas conectadas
spec: ../specs/editor-navegacion.md
status: pending-approval
timestamp: 2026-11-28
---

# Plan: editor-navegacion

## 0. Restricciones globales (literales)
- Móvil primero: probar en **412×915** (vertical) y **915×412** (horizontal).
- **Ningún `<select>`** ni menú desplegable.
- Estilo actual: botones redondeados grafito, acento rojo `--acc #d1242c`, iconos con etiqueta corta (`<small>`).
- Tamaño mínimo de toque **44 px**; deshacer/rehacer y Mover/Rotar **≥ 48 px**.
- Rama `feat/editor-navegacion` en `F:\STICKRONIN\.worktrees\editor-navegacion` (sale de `origin/dev`). Subir con `git fetch origin && git rebase origin/dev && git push origin HEAD:dev`; nunca forzar, nunca a `main`.
- Si se cambia `models/*.js`, subir `AV` y los `?v=` (no está previsto en este plan).

## 1. Contexto
- Spec §A1–A7. Reglas de `CLAUDE.md`: todo en español, visual antes que texto, pantalla táctil; el editor ya se rehízo sin desplegables el 28 nov 2026 (`#wStrip`, `#aStrip`, `#railL`, `#railR`, `#dock`).
- Hecho comprobado: el gizmo de ejes (`#axg`, `drawAxes`, su `pointerdown`) ya cambia de vista al tocar un eje; solo falta el gesto de volver a la vista libre (`VIEWS.free`).

## 2. Arquitectura
```
┌ barra de herramientas común (tools-nav.js) ──────────────┐  ← A4: igual en las 4 páginas
│ 🎬 Animación │ 🖌 Shaders │ 🧍 Modelo │ 🎮 Jugar          │
└───────────────────────────────────────────────────────────┘
 editor.html
 ┌ vista 3D ────────────────────────────────┐
 │ barra izq.: Cadena Codos Gizmo Fantasma  │  gizmo de ejes (más grande) ← A1
 │   Recorrido Correr Zombi Prota           │  barra der.: Centrar Paneo Pantalla
 │                                          │
 │ [↶][↷] [✥ Mover|⟳ Rotar]  ← «isla» fija   │  ← A2 + A3, abajo a la izquierda
 └──────────────────────────────────────────┘
 línea de tiempo · transporte · pestañas · panel (igual que ahora)
```
- **Isla de acciones** (nueva, dentro de la vista, abajo a la izquierda, a la altura del pulgar): deshacer, rehacer y el interruptor Mover/Rotar. Usa los mismos `id` (`bUndo`, `bRedo`, `bGzMode`) para no tocar su lógica; el interruptor pasa a ser dos botones (`data-gz="move|rot"`), y el viejo botón único desaparece.
- **Barra común** `tools-nav.js`: un archivo pequeño que pinta la barra de pestañas en cualquier página que lo cargue y marca la actual. Cada página decide dónde va (en el editor, encima de las tiras de armas; en horizontal, en la columna de la derecha).
- **Decisión clave:** barra común en un archivo compartido, no copiada en cada página. Así, añadir una herramienta nueva es tocar un solo sitio, y las cuatro páginas no se desincronizan (ya pasó con `inkstyle.js`/`zmodel.js`).
- **Alternativa descartada:** un botón «☰ Herramientas» que abra una lista. Es más compacto, pero es justo el tipo de menú escondido que Daniel no quiere.

## 3. Contratos
- `tools-nav.js` → `ToolsNav.mount(contenedor, actual)`: pinta 4 pestañas con su icono y nombre; la actual va marcada y no es enlace. Antes de salir pregunta a la página con `ToolsNav.canLeave()` (por defecto, sí). `modelo.html` devuelve «no» si hay cambios sin guardar y pide confirmación (A5).
- Gizmo: tocar dentro de un radio de 12 px del centro → `orb` pasa a `VIEWS.free`; tocar un eje → como ahora.
- Interruptor Mover/Rotar: un toque fija el modo (no alterna a ciegas); el botón activo va en rojo.
- Juego (`index.html`): en el menú principal, un botón «🛠 Herramientas» que lleva a `editor.html`, visible solo si `location.hostname` no termina en `github.io` (A6), igual que los números de daño.

## 4. Datos
- No hay datos nuevos. El editor ya guarda sus animaciones al momento en `localStorage`; Shaders guarda en `stickronin_ink`; Modelo marca `S.dirty`.
- La versión de los scripts compartidos se sube a la vez: `tools-nav.js?v=…` en las cuatro páginas.

## 5. Cómo se comprueba
| Criterio | Prueba (Playwright con Chrome, 412×915 y 915×412) |
|---|---|
| A1 | No existe `#viewBar`; tocar el eje X/Y/Z cambia `orb`; tocar el centro deja `orb` en `VIEWS.free`; el gizmo mide ≥ 96 px |
| A2/A3 | `#bUndo`, `#bRedo` y los dos botones de Mover/Rotar están dentro de la pantalla (su rectángulo dentro de la ventana) sin desplazar nada, en las dos orientaciones; tocar Rotar → `gzMode==='rot'` |
| A4 | Las 4 páginas tienen la barra con 4 pestañas y la actual marcada; cada enlace lleva a su página |
| A5 | En Modelo, pintar un vértice y tocar «Animación» → sale el aviso; al cancelar, no se va |
| A6 | En local se ve «🛠 Herramientas» en el menú del juego; con el nombre de host simulado `…github.io` no se ve |
| A7 | La prueba t48 entera (23 comprobaciones) sigue pasando; 0 `<select>` |
| Visual | Capturas antes/después en vertical y horizontal para Daniel |

## 6. Orden
1. `tools-nav.js` + montarla en `shaders.html` y `modelo.html` (con el aviso de cambios sin guardar). Comprobar A4 y A5.
2. Editor: isla de acciones (deshacer, rehacer, Mover/Rotar) y quitar esos botones de las barras. Comprobar A2 y A3.
3. Editor: quitar Frente/Lado/Arriba/3D, gizmo más grande, toque en el centro → vista libre. Comprobar A1.
4. Editor: montar la barra común (vertical y horizontal). Comprobar A4 en el editor.
5. Juego: botón «🛠 Herramientas» solo fuera de `github.io`. Comprobar A6.
6. Prueba t48 completa + capturas; `CLAUDE.md` (sección del editor) y FTD; subir a `dev`. Comprobar A7.

## 7. Riesgos
1. **Choque con la sesión de armas en `editor.html`** (también lo toca, en su rama). *Mitigación:* cambios acotados a la cabecera, las barras y la isla; traer `origin/dev` justo antes de cada subida y resolver conservando lo de las dos.
2. **Espacio en horizontal** (412 px de alto): la barra común resta ~36 px. *Mitigación:* en horizontal va en la columna derecha, junto a las tiras, no encima de la vista.
3. **La isla tapa la escena** al animar los pies. *Mitigación:* esquina inferior izquierda, semitransparente, y se aparta al reproducir.
4. **Caché de githack** mezclando versiones del nuevo `tools-nav.js`. *Mitigación:* `?v=` desde el primer día.

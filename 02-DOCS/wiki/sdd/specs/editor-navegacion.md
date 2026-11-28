---
type: spec
title: Editor — vistas con el gizmo, rotar y deshacer siempre a mano, navegación entre herramientas
status: pending-approval
timestamp: 2026-11-28
slug: editor-navegacion
---

# Especificación: editor más cómodo y herramientas conectadas

## Por qué
Daniel usa el editor en el móvil (sobre todo en horizontal). Con la captura del 28 nov 2026 señala cuatro problemas:
1. Los botones **Frente / Lado / Arriba / 3D** sobran: el **gizmo de ejes** de la esquina ya sirve para cambiar de vista.
2. **No encuentra cómo rotar** (el botón Mover/Rotar está arriba del todo en la barra izquierda y, en horizontal, la barra queda cortada).
3. **Deshacer y rehacer** están escondidos al final de la barra derecha, y se usan muchísimo.
4. No sabe **cómo pasar** entre Animación (`editor.html`), Shaders (`shaders.html`), Modelo y pesos (`modelo.html`) y el juego.

## Qué tiene que pasar (criterios de aceptación)
- **A1 Vistas con el gizmo.** Ya no hay botones Frente/Lado/Arriba/3D. Tocar un eje del gizmo mira desde ese lado (como ahora); tocar el **centro** del gizmo vuelve a la vista libre 3D. El gizmo es más grande y fácil de tocar.
- **A2 Mover/Rotar a la vista.** El cambio entre **✥ Mover** y **⟳ Rotar** es un interruptor de dos botones siempre visible, sin desplazar ninguna barra, en vertical y en horizontal.
- **A3 Deshacer/rehacer a mano.** **↶ Deshacer** y **↷ Rehacer** están siempre visibles junto a Mover/Rotar, con botones grandes, en vertical y en horizontal.
- **A4 Navegación común.** Las cuatro páginas (Animación, Shaders, Modelo y pesos, Jugar) comparten la misma barra de pestañas, siempre visible, que marca dónde estás; un toque cambia de herramienta.
- **A5 Sin perder trabajo.** Si en Modelo y pesos hay cambios sin guardar, avisa antes de salir.
- **A6 Del juego a las herramientas.** Desde el menú del juego hay un acceso a las herramientas, solo en las versiones de pruebas (`dev`, local); en la web oficial (`github.io`) no se ve.
- **A7 Nada se pierde.** Todas las funciones del editor siguen funcionando (prueba t48: 23 comprobaciones).
- **A8 Un solo desplegable.** Aclarado por Daniel el 28 nov 2026 («Algún menú desplegable está bien pero 1, no todos que sean así»): el editor tiene **un único** menú desplegable, «⋯ Más», con lo que se usa poco; lo que se usa mucho está siempre a la vista.

## Fuera de alcance
- Cambiar cómo se animan, se pintan pesos o se ajustan shaders.
- Rediseñar las barras de `shaders.html` y `modelo.html` más allá de la barra común.

# Propuesta: forja sencilla 鍛 — rarezas, fusión y piedras de afilar

28 nov 2026 · idea de Daniel, pendiente de que apruebe las decisiones del final. **No hay nada programado.**

Objetivo: dar una **vía segura para subir el daño del arma** (ahora depende de bendiciones y críticos) sin volver a la forja vieja (bolsa, huecos, metal, temple…). Convive con las bendiciones Kago: estas cambian *cómo* pegas y la forja, *cuánto*.

---

## 1. Rareza del arma 等級
| Rareza | Color | Daño base |
|---|---|---|
| Común | hueso | ×1 |
| Rara | azul | ×1,15 |
| Épica | morado | ×1,3 |
| Legendaria | oro | ×1,5 |

- Las 2 armas de la armería empiezan **comunes**.
- Las que recojas del suelo traen rareza al azar (más alta cuanto más avanzada la oleada).

## 2. Fusión 合わせ
- **2 armas iguales** (mismo tipo y rareza) = 1 arma de la rareza siguiente.
- Se queda el **mejor afilado** de las dos.
- Animación con fuego y un golpe de martillo, sin menús complicados: arrastras una sobre la otra.

## 3. Afilado 研ぎ (niveles)
| Nivel | Efecto |
|---|---|
| Malo 鈍 | −15 % de daño (algunas armas del suelo vienen así) |
| Normal | — |
| Bueno 良 | +10 % de daño |
| Afilado 鋭 | +20 % de daño |
| Letal 必殺 | +35 % de daño |
| Terrorífica 魔 | **Doble filo:** una estadística sube mucho (+60 %) y otra baja bastante (−30 %), al azar: daño, velocidad, alcance, recarga del especial, carga o movimiento. |
| Divina 神 | +50 % de daño y +20 % a todo lo demás (casi al máximo). |

Se ve en el arma: brillo y filo de distinto color, y el kanji del nivel junto al nombre.

## 4. Piedras de afilar 砥石
Se usan igual que la vieja forja de sangre:
- **Cada intento tiene una probabilidad de éxito.** Si sale bien, sube **1 nivel**, hasta el **tope de la piedra**.
- **Si falla, el siguiente intento tiene más probabilidad** (+10 %), para que no frustre.
- **La piedra se gasta al usarla**, salvo un 25 % de las veces, que se salva.

| Piedra | Tope | Éxito | Especial |
|---|---|---|---|
| **Arenisca** (pobre) 荒砥 | Bueno | 70 % | — |
| **Toishi tradicional** 天然砥石 | Letal | 50 % | 2 % de saltar directamente a **Divina** |
| **Piedra extraña** 妖石 | — | — | Deja el arma en **Afilado con un efecto especial** (bueno o malo: p. ej. robo de vida, o recibir más daño) **o** en **Terrorífica** (doble filo). Es una apuesta. |

Las piedras **nunca bajan** el nivel, salvo la extraña (es su gracia).

## 5. De dónde sale todo
- **Armas del suelo:** las sueltan los minijefes (15 %), los onis (30 %) y los jefes (siempre, rara o mejor). Solo de tus 2 tipos de arma, para que sirvan para fusionar. Al pisarlas: ✔ fusionar / guardar, o ✖ dejar.
- **Piedras:** en la tienda del tanuki (moneda 魂 tama). La arenisca es barata, el toishi caro y la extraña rara. A veces también las sueltan los minijefes.

## 6. Qué toca en el código (cuando se apruebe)
- Datos: `genWeapon` vuelve a guardar `rar` y `afi`; `refreshSM` multiplica el daño base (`WBASE`) por rareza y afilado.
- Pantalla de forja dentro de la cola del final de oleada (`kgEndQueue`): tus 2 armas, las del suelo y tus piedras; arrastrar para fusionar o afilar.
- Tienda (`SHOP`): 3 piedras nuevas.
- Botín de armas en el suelo (`LOOT` con `kind:'arma'`; el dibujo ya existe).
- Partida guardada, ℹ Info, textos, hoja de equilibrio y `CLAUDE.md`.
- Solo en partida normal y dojo (no en la Cacería ni en el asedio, de momento).

## 7. Equilibrio (estimado)
Legendaria y Divina = ×1,5 × 1,5 = **×2,25** de daño base. Es mucho, pero cuesta muchas fusiones y suerte. Un arma Rara y Afilada (lo normal hacia la oleada 8-10) da ×1,38. Con eso se arregla «no tengo forma de subir el daño» sin romper las bendiciones.

---

## Decisiones para Daniel
1. ¿Fusionar con **2** armas iguales o con **3**?
2. ¿Las armas del suelo, **solo de tus 2 tipos** o de cualquiera (y la puedes cambiar)?
3. ¿Piedras **solo en la tienda** (cada 5 oleadas) o también como botín de minijefes?
4. ¿Algo que quites o cambies de los niveles y las piedras?

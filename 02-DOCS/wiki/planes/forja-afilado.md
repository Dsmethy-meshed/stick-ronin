# Propuesta: forja sencilla 鍛 — rarezas, fusión y piedras de afilar

28 nov 2026 · idea de Daniel. **Hecho y subido a `dev`** (ver «Estado» al final).

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

---

## Estado (28 nov 2026)
Decisiones: piedras de minijefes y de **menas** que aparecen al empezar cada oleada (Daniel); el orbe del kami también puede dar cosas de la tienda (Daniel); fusión con **2** armas iguales y armas del suelo **solo de tus 2 tipos** (lo propuesto; Daniel no lo cambió). La fusión es automática al recoger (sin menú).
- [x] Rareza y afilado en el daño y las estadísticas (`fjApply`). **Prueba:** katana común + común → rara, daño ×1,15 y ★ en el botón.
- [x] Botín de minijefes, onis y jefes (`fjOnKill`). **Prueba:** un kappa con variante soltó piedra y arma; al recogerla la katana pasó a épica.
- [x] Menas (`menaSpawn`, `menaStep`). **Prueba:** al 3.er golpe la mena se rompe y suelta su piedra; la roca es sólida.
- [x] Pantalla 研 AFILAR (`fjForge`). **Prueba:** arenisca → Buena; extraña → Terrorífica (alcance +60 %, carga −30 %) y la piedra aguantó.
- [x] Piedras en la tienda; orbe con regalo de la tienda (35 %). **Prueba:** con probabilidad 1 el orbe aplicó un objeto de la tienda y siguió la partida.
- [x] Códice ℹ Info con el apartado 鍛 Forja.
- [ ] Probar en el móvil y ajustar probabilidades; hoja de equilibrio sin actualizar.
- [ ] Brillo del arma según afilado (ahora solo se ve en el botón y en la pantalla de afilar).
- [x] Cambio pedido por Daniel: fusión como la antigua, por progreso según lo parecidas que sean las rarezas (`FJ.fuse` 1 / 0,5 / 0,25 / 0,12, barra ▰▱ en el aviso y en la pantalla de afilar). **Prueba:** común+común → rara; rara+rara → épica; 3 comunes sobre épica → 75 %; épica+épica → legendaria.
- [x] Piedra de los kami 神砥 (pedida por Daniel): 50 % sube, 50 % baja, nunca Terrorífica (escalera Mala, Normal, Buena, Afilada, Letal, Divina; Terrorífica cuenta como Afilada). Sale en menas, minijefes y tienda (peso 1,5 de 11,5). **Prueba:** 58 cambios, 31 suben y 27 bajan, ninguno a Terrorífica; en Divina no hace nada ni se gasta.
- [ ] Vigilar: con la piedra de los kami, desde Letal hay un 50 % de llegar a Divina (con el toishi es un 2 %).
- [x] Pedido por Daniel: los bichos vuelven a soltar armas de cualquier tipo; al pisar una de otro tipo, ⇄ cambiar / 魂 vender / ⛓ acero / ✖. El acero templa la barra de rareza poco y menos según avanza la partida. **Prueba:** cambiar deja tu katana en el suelo y te quedas la naginata épica; al volver sale el menú; vender una rara da +10 魂; acero +1; ✖ cierra y el arma se queda; templar una épica en la oleada 3 da +6 %. Arreglado: el arma recién cogida se procesaba dos veces y se fusionaba consigo misma.
- [x] Menús de la forja rehechos para móvil (pedido por Daniel: «mejor que el anterior, más animaciones»): yunque con brillo, arrastrar piedras a la hoja, piedra que pasa por el filo, chispas, sello de tinta del resultado, martillazo del acero, barra que se llena; tarjeta del arma del suelo con rebote, comparación de daño y botones grandes. **Prueba** (412×915 y 915×412, Chrome): arrastrar la arenisca a la hoja → Buena; acero +8 %; pestañas; en horizontal cabe todo; la tarjeta del suelo no tapa los botones de combate.
- [x] Juntar piedras (pedido por Daniel): 4 areniscas = 1 toishi tradicional; 2 tradicionales = 1 piedra de los kami. Botón en la bandeja solo cuando tienes las suficientes, con animación (las piedras se funden y la nueva salta). **Prueba:** {arenisca 5, toishi 1} → {1, 2} → {1, 0, kami 1}, sin errores.
- [x] Daniel no veía armas: caían ~0,3 en las oleadas 1-3. Ahora siempre cae un arma junto a ti al superar la oleada y suben las probabilidades (zombis 3 %, arañas 15 %, yokai 30 %, minijefes 25 %, onis 40 %). **Prueba:** 6 partidas simuladas, oleadas 1-5: 9,8 armas de media (antes 3,8), ~2 por oleada desde la 1.
- [x] La rareza mejora también velocidad de ataque, carga y recarga del especial (+6/12/20 %), visible en la forja y en la tarjeta del suelo. **Prueba:** épica frente a común: daño ×1,30, velocidad, carga y recarga ×1,12.
- [x] La pantalla 鍛 FORJA (menú de las armas) sale al final de cada oleada, tengas piedras o no.

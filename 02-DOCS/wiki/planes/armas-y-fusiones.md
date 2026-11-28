# Plan: armas distintas y bendiciones que se mezclan

28 nov 2026 · propuesta para decidir con Daniel. Todavía no hay nada cambiado.

---

## 1. Qué hacen otros juegos (y qué nos llevamos)

| Juego | Cómo funcionan sus armas | Qué copiamos |
|---|---|---|
| **Monster Hunter** | 14 armas y cada una tiene un **verbo distinto**: la gran espada carga, el arco esquiva, la lanza bloquea y la gunlance explota. Nunca hay dos que se jueguen igual. | Cada arma = **un verbo propio**, no solo otro número. |
| **Hades / Hades II** | Solo 6 armas, muy distintas, cada una con «aspectos» que cambian cómo funciona. Las bendiciones de 2 dioses abren **dúos**. | Menos armas pero más marcadas. Las bendiciones se cruzan. |
| **Vampire Survivors** | **Evoluciones**: un arma + un objeto concreto = un arma nueva y mucho más fuerte. Se apuntan en un libro y se descubren. | **Fusiones que se desbloquean** y quedan guardadas en una colección. |
| **Genshin Impact** | **Reacciones elementales**: fuego sobre hielo = derretir (×2), rayo sobre agua = descarga en cadena. Mezclar elementos siempre recompensa. | Dos estados sobre el mismo enemigo = **reacción** automática. |
| **Nioh 2 / Sekiro / Ghost of Tsushima** | Armas japonesas (katana, ōdachi, kusarigama, nitō, puños, hacha) con **posturas**. Las animaciones tienen anticipación, golpe seco y recuperación. Cada postura sirve contra un tipo de enemigo. | Animaciones de katana con peso de verdad (ver §5). |
| **Enter the Gungeon / Brotato / 20 Minutes Till Dawn** | Disparar **sin dejar de moverte** es el centro del juego; cada arma intercambia cadencia y movilidad. | Shuriken metralleta que dispara corriendo (§4). |
| **Dead Cells** | Armas rápidas, pesadas y de escudo; **crítico condicional** (ya lo tenemos: Kaishin). | Ya está; reforzar los iconos. |
| **Bloodborne** | Armas con truco que **se transforman** a media pelea. | Idea para más adelante (tessen ↔ abanico abierto). |

> Fuente: lo que sé de estos juegos. No he hecho una búsqueda nueva en internet.

---

## 2. Diagnóstico: qué armas se sienten iguales

Medido en el juego (simulación de la oleada 5) y viendo cómo se mueven:

- **Kama y nitō:** dos armas cortas en las dos manos, combos rápidos de 4 golpes y carrera «dual». Se juegan igual.
- **Tessen y kama:** las dos ligeras, rápidas y de poco alcance; el tessen solo se distingue por su planeo.
- **Katana, nitō y ōdachi:** las tres son «barrido en arco» con distinto tamaño.
- **Yari y naginata:** las dos son de asta y alcance medio; la diferencia (estocada frente a barrido) apenas se nota.
- **Kusarigama:** la más fuerte con diferencia (×2 que la segunda). Barre en 3 m a todo el grupo.

---

## 3. Propuesta de 12 armas: un verbo y un movimiento cada una

| # | Arma | Su verbo (lo que solo hace ella) | Movimiento propio | Cambio |
|---|---|---|---|---|
| 1 | **Katana** 刀 | **Duelo:** desenvaine iai y contraataque tras la esquiva perfecta. | Dash-corte (iai) que atraviesa. | **Animaciones nuevas** (§5) y combo de 4. |
| 2 | **Nitō** 双 | **Torbellino sin fin:** el combo no se corta mientras sigas golpeando. Modo demonio. | Encadena 3 dashes cortos seguidos. | Quitar el parecido con kama. |
| 3 | **Ōdachi** 太 | **Tajo imparable:** súper armadura mientras carga y rompe armaduras. | Lento, pero el especial te teletransporta. | Igual; reforzar la súper armadura. |
| 4 | **Kanabō** 棒 | **Terremoto:** golpes al suelo con ondas que derriban. | El más lento; embestida que arrolla. | Ondas visibles en cada golpe fuerte. |
| 5 | **Yari** 槍 | **Carga:** mantener = correr con la lanza por delante y ensartar a varios en fila. | Sprint de carga. | Pasarle la pértiga de la naginata. |
| 6 | **Naginata** 薙 | **Molino:** giros de 360° que mantienen a raya. | Gira mientras se mueve. | Especial nuevo: giro largo. |
| 7 | **Kusarigama** 鎖 | **Control:** engancha, atrae y lanza enemigos contra otros. | Gancho para moverse (ya lo tiene). | **Bajar daño en área** ~30 %; más fuerza en el agarre. |
| 8 | **Shuriken** 星 | **Metralleta** (§4). | **La única que dispara corriendo casi a toda velocidad.** | Rehecho. |
| 9 | **Yumi** 弓 | **Francotirador:** flecha cargada que atraviesa y crítico a la cabeza. | Retrocede mientras dispara. | Frenarla más al disparar que al shuriken. |
| 10 | **Tanegashima** 銃 | **Escopeta:** cono de perdigones a quemarropa + **retroceso que te lanza** (salto con el disparo). | Se planta para disparar; el retroceso es su dash. | De francotirador a escopeta. |
| 11 | **Tekkō** 鉄甲 *(nueva, sustituye a la kama)* | **Pelea a puños:** gancho que levanta, combos en el aire, **agarrar un zombi y lanzarlo** contra los demás (aprovecha los ragdolls). | Saltos y combos aéreos; agarre. | Nueva. Encaja con el protagonista 3D, que ya tiene los puños cerrados. |
| 12 | **Ofuda** 札 *(nueva, sustituye al tessen)* | **Onmyōji:** pega talismanes en el suelo que son trampas o torretas e invoca un shikigami. Es el arma que más aprovecha las bendiciones (cada talismán lleva el estado del kami). | Especial: grulla de papel con la que **planeas** (hereda el planeo del tessen). | Nueva. |

**Por qué quitar kama y tessen y no otras:** son las dos que más se solapan con otras (nitō y armas rápidas). Además, sus mejores ideas no se pierden: el planeo pasa al Ofuda y lanzar hoces que vuelven, a un martillo de la kusarigama.

**Coste de quitar un arma** (hay que hacerlo todo junto): `WT`, `ATK`, `WBASE`, `KAI`, `TSUCHI`, `RYU`, iconos `WICON`, descripciones `WDESC`, editor (`GEN_ATK`), armas del suelo de la Cacería, maestría guardada en `stickronin_ryu` (convertir la de kama → tekkō y la de tessen → ofuda), hoja de equilibrio y textos de ayuda.

---

## 4. Shuriken metralleta

- **Mantener atacar = ráfaga continua:** unos 8 shurikens por segundo, apuntando solo al más cercano. Cada uno hace poco daño (0,45), pero llegan muchos impactos, cada uno con su efecto de bendición: con Raijin, una metralleta de rayos.
- **Tocar = abanico de 5** (lo de ahora).
- **Corriendo:** mientras dispara mantiene el **95 % de la velocidad**. Es la **única** arma que puede hacerlo. Regla general:

| Arma a distancia | Velocidad mientras dispara |
|---|---|
| Shuriken | 95 % |
| Yumi | 60 % (puede retroceder) |
| Tanegashima | 30 %, y el retroceso te empuja |
| Ofuda | 70 % |

- **Calor:** tras 3 s seguidos de ráfaga se calienta. Las estrellas salen rojas y más lentas durante 1 s, para que no sea pulsar y olvidarse.
- **Especial (humo):** sin cambios. El abanico de kunai pasa a ser el final de la ráfaga.
- **En pantalla:** estela de estrellas, casquillos de papel y el contador del combo subiendo rápido. Visual, nada de texto.

---

## 5. Katana: animaciones nuevas

Las de ahora son 3 tajos sin peso. La propuesta es un combo de **4 golpes** al estilo de Sekiro y Ghost of Tsushima:

1. **Kesa-giri:** diagonal de hombro a cadera. Anticipación corta y golpe seco.
2. **Gyaku-kesa:** diagonal de vuelta (de abajo arriba).
3. **Yoko-giri:** horizontal amplio con paso adelante (barre el grupo).
4. **Nukitsuke final:** envaina y desenvaina en un giro, **corte de viento** y sacude la sangre de la hoja (*chiburi*).

Cada uno con **anticipación → golpe (2-3 fotogramas) → mantener → recuperación**, el cuerpo girando con la cadera y no solo con el brazo, y una pausa al golpear (hitstop).

Dos caminos para hacerlas (los dos dejan los clips editables en el editor):
- **A (recomendado):** usar el complemento de Blender que hizo la otra sesión, que pasa animaciones de Mixamo a los 11 palos. Hacen falta animaciones de espada de Mixamo: **Daniel tiene que descargarlas con su cuenta** (yo no creo cuentas). Después las ajusto en el editor.
- **B:** hacerlas yo a mano con fotogramas clave en el editor, tomando como referencia poses de kendo/iaidō. Sale más lento y más rígido.

---

## 6. Bendiciones que se mezclan

Dos capas: una que pasa sola y otra que se descubre.

### 6.1 Reacciones 反応 (automáticas, como en Genshin)
Si un enemigo tiene dos estados de kami a la vez, **reaccionan** y explotan. Así cualquier mezcla de dos kami recompensa, aunque no tengas el dúo.

| Estados | Reacción | Qué pasa |
|---|---|---|
| ⚡ shock + 🌪 empuje | **Tormenta** 嵐 | Rayo en cadena a todo lo que el viento arrastra. |
| 🔥 quemadura + ❄ escarcha | **Vapor** 蒸 | Estallido ×2 y nube que ciega (los enemigos fallan sus golpes). |
| ⚡ shock + 🔥 quemadura | **Sobrecarga** 爆 | Explosión de 2,5 m. |
| ❄ escarcha + ⚡ shock | **Granizo** 雹 | Rompe la armadura al instante. |
| 🩸 herida + 🌙 marca | **Luna de sangre** 血月 | La herida estalla como crítico ×3. |
| 🌸 encanto + 🔥 quemadura | **Fuego fatuo** 狐火 | El encantado arde y contagia a los que toca. |
| 🌪 empuje + ❄ escarcha | **Ventisca** 吹雪 | Los empujados congelan a los que golpean. |
| 🌙 marca + 🌸 encanto | **Ilusión** 幻 | El marcado deja un clon tuyo que pelea 3 s. |

Cada reacción tiene **un kanji grande, un color y un sonido propios**. La primera vez que la provocas, sale un rótulo grande.

### 6.2 Fusiones 合体 Gattai (builds que se desbloquean, como las evoluciones de Vampire Survivors)
- **Cómo se abre:** dos kami en tus ranuras, los dos a nivel 2 o más (Omiki) → aparece una **carta dorada de fusión**.
- **Qué hace:** convierte las bendiciones de esos dos kami en **un elemento nuevo**, con estado, color, aura del arma y versión de las 5 ranuras propios, y más fuerte que los dos por separado. Ejemplo:
  - **雷嵐 Tormenta (Raijin + Fūjin):** los golpes crean mini-tornados electrificados que arrastran y electrocutan; el dash es un tornado-rayo y el especial, un huracán de 6 s.
- **Se desbloquean:** la primera vez que fusionas, queda guardada en un **Libro de fusiones** (`localStorage`) con su silueta. Las no descubiertas salen como «？？？», para que haya ganas de completarlo.
- **Primeras 8 fusiones:** Tormenta (⚡🌪), Fuego del infierno (🔥🌪, a partir del dúo Hi-tatsumaki), Niebla (🔥❄), Granizo (⚡❄), Luna de sangre (🩸🌙), Zorro de nueve colas (🦊🌸), Plasma (⚡🔥) y Ventisca (🌪❄).
- Los 12 dúos Musubi de ahora pasan a ser el escalón previo de su fusión, o desaparecen si ya los cubre una reacción.

### 6.3 Equilibrio de Raijin
Con reacciones y fusiones, Raijin deja de ser la única opción. Aun así, conviene bajar sus rayos ~20 % para que no sea la elección obvia.

---

## 7. Orden propuesto (cada fase se sube a `dev` y se prueba en el móvil)

| Fase | Qué | Tamaño |
|---|---|---|
| 1 | **Shuriken metralleta** + regla de velocidad al disparar | Pequeño (1 sesión) |
| 2 | **Animaciones nuevas de la katana** (camino A o B) | Medio |
| 3 | **Reacciones 反応** (8) | Medio |
| 4 | **Fusiones 合体**: Tormenta primero, luego las otras 7 y el libro | Grande |
| 5 | **Tekkō** en lugar de la kama | Grande (malla, combo, agarre, editor) |
| 6 | **Ofuda** en lugar del tessen | Grande |
| 7 | Retoques: yari carga, naginata molino, tanegashima escopeta, kusarigama −30 % de área | Medio |

En cada fase: medir con la simulación de daño, capturas para Daniel, y actualizar textos, ℹ Info, `CLAUDE.md`, el FTD de Kago y la hoja de equilibrio.

---

## 8. Decisiones de Daniel
- **28 nov 2026:** la **kama se queda** (le gusta) y el **tessen se va**. Para que la kama no se juegue igual que el nitō, su verbo será **asesina**: SOMBRA te pone a la espalda, el crítico por la espalda (Kaishin ×3) es su seña y sus hoces lanzadas vuelven. El nitō se queda con el torbellino sin fin.
- Pendiente: qué arma nueva sustituye al tessen (Ofuda, Tekkō u otra).

## 8b. Decisiones que siguen abiertas
1. ¿Kama y tessen se van? ¿O prefieres quitar otras dos?
2. ¿Tekkō (puños) y Ofuda (talismanes) te gustan como sustitutas?
3. Katana: ¿camino A (Mixamo, descargas tú las animaciones) o B (a mano)?
4. ¿Empezamos por la fase 1 (shuriken)?

---
title: Flujo de ramas dev/main y harness rsc en GitHub
date: 2026-11-26
branch: dev
status: pending-approval
---

# Spec — Flujo de ramas dev/main y harness rsc en GitHub

## Problem & why
Hasta ahora el juego se trabajaba en artifacts de Claude y solo se subía a GitHub de vez en cuando, con permiso de Daniel. Ahora Daniel quiere que todo el trabajo esté en GitHub y se actualice todo el rato, para probarlo bien. Pero GitHub Pages publica `main` directamente: si cada cambio va a `main`, los jugadores reciben versiones a medio hacer.

## Cost of not building it
Hay dos salidas, y las dos son malas:
- Seguir sin subir nada hasta que Daniel apruebe: el trabajo vive solo en un PC, sin copia ni historial, y no se puede probar desde el móvil.
- Subirlo todo a `main`: cualquier error llega a todos los jugadores y Sentry mezcla los errores de prueba con los reales.

## The cheapest alternative
Subirlo todo a `main` y aceptar que a veces se rompa. Es gratis, pero rompe el juego publicado y llena Sentry de ruido. Una segunda rama cuesta muy poco más y evita los dos problemas.

## Goals
- El trabajo diario se guarda en GitHub en la rama `dev`, sin pedir permiso en cada subida.
- `main` (lo publicado) solo cambia cuando Daniel lo aprueba.
- El harness rsc (skills, agentes, hooks, `02-DOCS/`, `01-TOOLS/`) queda versionado en el repo.
- `CLAUDE.md` refleja las reglas nuevas.

## Non-goals / out of scope
- Publicar `dev` en una segunda web de Pages para probar en el móvil. Se decide aparte.
- Cambiar código del juego (`index.html`) o subir de versión (sigue en v1.5).
- Fusionar `dev` en `main`. Eso será otra aprobación de Daniel.
- Quitar `editor.html` de GitHub. Daniel decidió dejarlo.

## Users & context
Daniel, que desarrolla y prueba en Android y PC, y Claude Code, que trabaja en `F:\STICKRONIN`. Los jugadores solo ven `main` en GitHub Pages.

## Qué podrá hacer el usuario
- Daniel podrá ver en GitHub, en la rama `dev`, todo lo que se va haciendo, y bajarlo en cualquier equipo.
- Claude podrá subir a `dev` sin pedir permiso cada vez.
- Daniel seguirá decidiendo cuándo se publica en `main`.

## Qué resultado obtiene
- Existe la rama `origin/dev` con el commit del harness y las reglas nuevas.
- `origin/main` sigue exactamente igual (commit `3a15e29`), así que el juego publicado no cambia.
- `CLAUDE.md` en `dev` contiene las reglas 1, 2 y 6 nuevas.

## Qué debe respetar
- No tocar `main` ni GitHub Pages.
- No subir secretos: `01-TOOLS/` solo lleva la plantilla (`.env.example` y `CREDENTIALS.md` vacíos), y `.claude/settings.local.json` queda fuera.
- Mantener intactas las reglas del proyecto que no se han cambiado (por ejemplo, no borrar datos de la hoja del ranking).
- No incluir la nota suelta `Stick Rōnin 3D.md`.

## Cómo lo demuestra
- `git ls-remote origin` muestra `refs/heads/dev` y `refs/heads/main` con el mismo hash de antes (`3a15e29`).
- `git show --stat origin/dev` lista solo archivos del harness, `02-DOCS/`, `01-TOOLS/` y `CLAUDE.md`.
- Un grep de `01-TOOLS/` en `dev` no encuentra valores de credenciales, solo la plantilla.

## Behaviour
1. Claude trabaja en local sobre `dev`, hace commit y sube a `origin/dev`.
2. Cuando Daniel aprueba una versión, se fusiona `dev` en `main`, se suben `GAME_VER`, `GAME_DATE`, `GAME_NOTES` y `version.json`, y se publica.

## Acceptance criteria
- [ ] `origin/dev` existe y contiene el commit del harness.
- [ ] `origin/main` sigue en `3a15e29`.
- [ ] No se sube ningún secreto ni `settings.local.json`.
- [ ] `CLAUDE.md` en `dev` tiene las reglas nuevas.

## Points to clarify
- La constitución del proyecto (`02-DOCS/wiki/sdd/constitution.md`) sigue en borrador. Esta spec no depende de ella: es un cambio de flujo de trabajo, no de código del juego.
- Cómo probar `dev` en el móvil queda fuera de esta spec.

## Revisions
- 2026-11-26: primera versión.
